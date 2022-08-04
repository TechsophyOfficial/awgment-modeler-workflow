import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import inputOutputHelper from 'bpmn-js-properties-panel/lib/helper/InputOutputHelper';
import { BpmnFactory, CommandStack, ModelerElement, Command } from 'camunda-modeler-types';

export interface PickedOperationInfo {
    serviceId: string;
    operationId: string;
    method: string;
    path: string;
    sellectedPanelIndex?: number | null;
    reqBodyContentType: string | null;
    pathMapping: ParameterMapping;
    queryMapping: ParameterMapping;
    outputMapping: ParameterMapping;
    reqBodyMapping: ParameterMapping;
}

interface ParameterMapping {
    [key: string]: unknown;
}

export interface RuleOperationInfo {
    name?: string;
    method: string;
    path: string;
    inputParameter?: string;
    outputParameter?: ParameterMapping;
    inputParameterSchema: string;
    outputParameterSchema: string;
}

interface OutputParameterMapping {
    message?: string;
    success?: string;
    results?: {
        eligibility?: string;
        approved?: string;
    };
    parentKey?: string;
}

export interface PropertyValue {
    $type: string;
    name: string;
    value: string;
}

export interface PropertiesTypes {
    $type: string;
    values: PropertyValue[];
}

interface Output {
    name: string;
    value: string;
}

interface Input {
    name: string;
    value?: string;
    definition?: ModelerElement;
}

interface InputParameteTypes {
    [name: string]: { $type?: string; name?: string; value?: string };
}

interface ConnectorTypes {
    $type?: string;
    inputParameters?: InputParameteTypes;
    outputParameters?: [];
}

export const getPickedOperationProperty = (
    element: ModelerElement,
    bpmnFactory: BpmnFactory,
    commandStack: CommandStack,
): (PickedOperationInfo & RuleOperationInfo) | undefined => {
    getConnector(element, bpmnFactory, commandStack);
    const propertyInfo = getProperties(element, bpmnFactory, commandStack);
    if (propertyInfo && propertyInfo?.values?.length > 0) {
        const operationInfoArr = propertyInfo?.values?.filter(
            (operation: PropertyValue) => operation.name === 'operationInfo',
        );
        return operationInfoArr?.length > 0 ? JSON.parse(operationInfoArr[0].value) : undefined;
    }
    return undefined;
};

export const setPickedOperationProperty = (
    element: ModelerElement,
    bpmnFactory: BpmnFactory,
    commandStack: CommandStack,
    appStoreOperation?: PickedOperationInfo | undefined,
    ruleOperation?: RuleOperationInfo | undefined,
): void => {
    const inputOutputElement = inputOutputHelper.getInputOutput(element, true);
    const inputParameterElement = inputOutputHelper.getInputParameter(element, true);
    const arr: Output[] = [];
    const createOutputList = (obj: OutputParameterMapping): Output[] => {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'string') {
                if (obj[key].length && key !== 'parentKey') {
                    let name = '';
                    if (obj[key].startsWith('${') && obj[key].endsWith('}')) {
                        name = obj[key].substring(obj[key].lastIndexOf('${') + 2, obj[key].lastIndexOf('}'));
                    }

                    name &&
                        arr.push({
                            name: name,
                            value: `${'$'}{S(response)${obj.parentKey ? obj.parentKey : ''}.prop("${key}").value()}`,
                        });
                }
            } else {
                if (obj[key] !== null && typeof obj[key] !== 'number' && typeof obj[key] !== 'boolean') {
                    obj[key].parentKey = `${obj.parentKey ? obj.parentKey : ''}.prop("${key}")`;
                    createOutputList(obj[key]);
                }
            }
        });
        return arr;
    };

    if (inputOutputElement) {
        const commands: Command[] = [];

        const inputParametersArray = inputOutputElement?.inputParameters?.filter((elem: ModelerElement) =>
            is(elem, 'camunda:InputParameter'),
        );

        const outputParametersArray = inputOutputElement?.outputParameters?.filter((elem: ModelerElement) =>
            is(elem, 'camunda:OutputParameter'),
        );

        const createInputCmd = (props: Input): void => {
            const createdElement = elementHelper.createElement(
                'camunda:InputParameter',
                props,
                inputOutputElement,
                bpmnFactory,
            );
            commands.push(
                cmdHelper.addAndRemoveElementsFromList(
                    element,
                    inputOutputElement,
                    'inputParameters',
                    'inputOutput',
                    [createdElement],
                    inputParametersArray,
                ),
            );
        };

        const createPropertyCmd = (propertyProps: Input): void => {
            const properties = getProperties(element, bpmnFactory, commandStack);
            if (properties) {
                const elementsArray = properties?.values?.filter(
                    (elem: ModelerElement) => is(elem, 'camunda:Property') && elem.name === 'operationInfo',
                );
                const property = elementHelper.createElement(
                    'camunda:Property',
                    propertyProps,
                    properties,
                    bpmnFactory,
                );
                commands.push(
                    cmdHelper.addAndRemoveElementsFromList(
                        element,
                        properties,
                        'values',
                        'properties',
                        [property],
                        elementsArray,
                    ),
                );
            }
        };

        const createOutputCmd = (props: Output): void => {
            const responseElement = elementHelper.createElement(
                'camunda:OutputParameter',
                props,
                inputOutputElement,
                bpmnFactory,
            );
            commands.push(
                cmdHelper.addAndRemoveElementsFromList(
                    element,
                    inputOutputElement,
                    'outputParameters',
                    'inputOutput',
                    [responseElement],
                    outputParametersArray,
                ),
            );
        };

        if (appStoreOperation) {
            const prop = { name: 'operationInfo', value: JSON.stringify(appStoreOperation) };
            createPropertyCmd(prop);

            if (appStoreOperation.method) {
                const props = { name: 'method', value: appStoreOperation.method.toUpperCase() };
                createInputCmd(props);
            }

            if (appStoreOperation.reqBodyContentType) {
                const entryProps = { key: 'Content-Type', value: appStoreOperation.reqBodyContentType };
                const entryElement = elementHelper.createElement(
                    'camunda:Entry',
                    entryProps,
                    inputParameterElement,
                    bpmnFactory,
                );
                const mapProps = { entries: [entryElement] };
                const mapElement = elementHelper.createElement(
                    'camunda:Map',
                    mapProps,
                    inputParameterElement,
                    bpmnFactory,
                );
                const headersProps = { name: 'headers', definition: mapElement };
                createInputCmd(headersProps);
            }

            if (appStoreOperation.reqBodyMapping && appStoreOperation.reqBodyMapping.payload) {
                const payload = JSON.parse(appStoreOperation.reqBodyMapping.payload as string);
                const payloadSchema = JSON.parse(appStoreOperation.reqBodyMapping.payloadSchema as string);
                const payloadArr = (appStoreOperation.reqBodyMapping.payload as string).split('');
                Object.keys(payloadSchema).forEach((key) => {
                    const index = payloadArr.join('').indexOf(key);
                    const keyLength = key.length;
                    const valueLength = payload[key] && payload[key].length;

                    if (payloadSchema[key] !== 'string') {
                        if (valueLength && typeof payload[key] === 'string') {
                            payloadArr.splice(index + keyLength + 2, 1);
                            payloadArr.splice(index + keyLength + valueLength + 2, 1);
                        }
                    }
                });
                const props = { name: 'payload', value: payloadArr.join('') };
                createInputCmd(props);
            }

            if (appStoreOperation.path) {
                let pickedOperationPath = appStoreOperation.path;

                if (Object.keys(appStoreOperation.pathMapping).length > 0) {
                    Object.keys(appStoreOperation.pathMapping).forEach((path) => {
                        if (
                            (appStoreOperation.pathMapping[path] as string).startsWith('${') &&
                            (appStoreOperation.pathMapping[path] as string).endsWith('}')
                        ) {
                            pickedOperationPath = pickedOperationPath.replace(
                                `{${path}}`,
                                appStoreOperation.pathMapping[path] as string,
                            );
                        } else {
                            pickedOperationPath = pickedOperationPath.replace(
                                `{${path}}`,
                                encodeURI(appStoreOperation.pathMapping[path] as string),
                            );
                        }
                    });
                }

                if (Object.keys(appStoreOperation.queryMapping).length > 0) {
                    Object.keys(appStoreOperation.queryMapping).forEach((query) => {
                        if (
                            (appStoreOperation.queryMapping[query] as string).startsWith('${') &&
                            (appStoreOperation.queryMapping[query] as string).endsWith('}')
                        ) {
                            if (Object.keys(appStoreOperation.queryMapping).indexOf(query) === 0) {
                                pickedOperationPath = pickedOperationPath.concat(
                                    `?${query}=${appStoreOperation.queryMapping[query]}`,
                                );
                            } else {
                                pickedOperationPath = pickedOperationPath.concat(
                                    `&${query}=${appStoreOperation.queryMapping[query]}`,
                                );
                            }
                        } else {
                            if (Object.keys(appStoreOperation.queryMapping).indexOf(query) === 0) {
                                pickedOperationPath = pickedOperationPath.concat(
                                    encodeURI(`?${query}=${appStoreOperation.queryMapping[query]}`),
                                );
                            } else {
                                pickedOperationPath = pickedOperationPath.concat(
                                    encodeURI(`&${query}=${appStoreOperation.queryMapping[query]}`),
                                );
                            }
                        }
                    });
                }
                const pathProps = { name: 'url', value: pickedOperationPath };
                createInputCmd(pathProps);
            }

            if (appStoreOperation.outputMapping) {
                const outputs = createOutputList(appStoreOperation.outputMapping);
                if (outputs.length > 0) {
                    outputs.forEach((output: Output) => {
                        createOutputCmd(output);
                    });
                }
            }
        }

        if (ruleOperation) {
            const prop = { name: 'operationInfo', value: JSON.stringify(ruleOperation) };
            createPropertyCmd(prop);

            if (ruleOperation.name) {
                const props = { name: 'selectedRuleName', value: ruleOperation.name };
                createInputCmd(props);
            }

            if (ruleOperation.method) {
                const props = { name: 'method', value: ruleOperation.method.toUpperCase() };
                createInputCmd(props);
            }
            if (ruleOperation.path) {
                const props = { name: 'url', value: encodeURI(ruleOperation.path) };
                createInputCmd(props);
            }

            if (ruleOperation.inputParameter) {
                const payload = JSON.parse(ruleOperation.inputParameter);
                const payloadSchema = JSON.parse(ruleOperation.inputParameterSchema);
                const payloadArr = ruleOperation.inputParameter.split('');
                Object.keys(payloadSchema).forEach((key) => {
                    const index = payloadArr.join('').indexOf(key);
                    const keyLength = key.length;
                    const valueLength = payload[key] && payload[key].length;

                    if (payloadSchema[key] !== 'string') {
                        if (valueLength && typeof payload[key] === 'string') {
                            payloadArr.splice(index + keyLength + 2, 1);
                            payloadArr.splice(index + keyLength + valueLength + 2, 1);
                        }
                    }
                });

                const props = { name: 'payload', value: payloadArr.join('') };
                createInputCmd(props);
            }
            if (ruleOperation.outputParameter) {
                const outputs = createOutputList(ruleOperation.outputParameter);
                if (outputs.length > 0) {
                    outputs.forEach((output: Output) => {
                        createOutputCmd(output);
                    });
                }
            }
        }
        commands.forEach((ccc: Command) => commandStack.execute(ccc.cmd, ccc.context));
    }
};

export const getConnector = (
    element: ModelerElement,
    bpmnFactory: BpmnFactory,
    commandStack: CommandStack,
): ConnectorTypes | undefined => {
    if (element && commandStack) {
        const bo = getBusinessObject(element);
        const extensionElements = bo.get('extensionElements');
        const connectorArray = extensionElements.values.filter((elem: ModelerElement) => is(elem, 'camunda:Connector'));
        const connectorElement = inputOutputHelper.getConnector(element);
        const connectorBo = getBusinessObject(connectorElement);
        let inputOutput;
        if (!connectorArray[0]['inputOutput']) {
            inputOutput = elementHelper.createElement(
                'camunda:InputOutput',
                { inputParameters: [], outputParameters: [] },
                connectorArray[0],
                bpmnFactory,
            );
            const ccc = cmdHelper.updateBusinessObject(connectorElement, connectorBo, { inputOutput: inputOutput });
            commandStack.execute(ccc.cmd, ccc.context);
        } else inputOutput = connectorArray[0]['inputOutput'];

        return inputOutput;
    }
    return undefined;
};

export const getProperties = (
    element: ModelerElement,
    bpmnFactory: BpmnFactory,
    commandStack: CommandStack,
): PropertiesTypes | undefined => {
    if (element && commandStack) {
        const commands: Command[] = [];
        const bo = getBusinessObject(element);
        let extensionElements = bo.get('extensionElements');

        if (!extensionElements) {
            extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
            commands.push(cmdHelper.updateBusinessObject(element, bo, { extensionElements: extensionElements }));
        }

        let properties;
        const propertiesArray = extensionElements.values.filter((elem: ModelerElement) =>
            is(elem, 'camunda:Properties'),
        );

        if (!propertiesArray || propertiesArray.length === 0) {
            properties = elementHelper.createElement(
                'camunda:Properties',
                { values: [] },
                extensionElements,
                bpmnFactory,
            );
            commands.push(
                cmdHelper.addAndRemoveElementsFromList(
                    element,
                    extensionElements,
                    'values',
                    'extensionElements',
                    [properties],
                    [],
                ),
            );
        } else {
            properties = propertiesArray[0];
        }

        if (commands.length > 0) {
            commands.forEach((ccc: Command) => commandStack.execute(ccc.cmd, ccc.context));
        }

        return properties;
    }
    return undefined;
};
