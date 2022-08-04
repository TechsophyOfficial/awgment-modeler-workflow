import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import 'react-accessible-accordion/dist/fancy-example.css';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-overrides.css';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import inputOutputHelper from 'bpmn-js-properties-panel/lib/helper/InputOutputHelper';
import SwaggerUI from 'swagger-ui-react';
import { PickServicePlugin } from './SwaggerPlugin';
import PluginPopup, { hide, initialModalState, ModalState, cancel, show } from '../../PluginPopup';
import { Form } from 'react-formio';
import {
    FormioSchema,
    getTextAreaSchema,
    getTextFieldSchema,
    submitButtonSchema,
    TextArea,
} from '../formPicker/FormTypes';
import { BpmnFactory, CommandStack, ModelerElement } from 'camunda-modeler-types';
import {
    OpenAPIObject,
    ParameterObject,
    PathItemObject,
    RequestBodyObject,
    HeadersObject,
    SchemaObject,
    SchemasObject,
} from 'openapi3-ts';
import {
    ContentObject,
    MediaTypeObject,
    OperationObject,
    PathsObject,
    ReferenceObject,
} from 'openapi3-ts/src/model/OpenApi';
import { ParameterLocation } from 'openapi3-ts/dist/model/OpenApi';
import { getSwaggerSpecsList } from '../../../../services/SwaggerService';
import {
    Accordion,
    AccordionItem,
    AccordionItemButton,
    AccordionItemHeading,
    AccordionItemPanel,
} from 'react-accessible-accordion';

interface FormattedSchema {
    [key: string]: string;
}

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

export interface SelectedOperationWithSpec extends PickedOperationInfo {
    swaggerSpec: OpenAPIObject;
}

interface ServicePickerProps {
    element?: ModelerElement;
    commandStack: CommandStack;
    bpmnFactory?: BpmnFactory;
    showPickOptions: boolean;
    getPickedOperation: () => PickedOperationInfo | undefined;
    onPicked: (po: PickedOperationInfo) => void;
    saved: boolean;
    cancelled: boolean;
}

interface ParameterMapping {
    [key: string]: unknown;
}

interface FormValues {
    data: {
        outputSchema: string;
        output: string;
        payloadSchema: string;
        payload: string;
        submit: boolean;
    };
}

interface ExtendedParameterObject extends Omit<ParameterObject, 'in'> {
    in: ParameterLocation | 'reqBody' | 'output';
}
interface ParameterMapperProps {
    operation?: SelectedOperationWithSpec;
    prevOperation?: PickedOperationInfo;
    onSaveParameterMapping: (
        parameters: ExtendedParameterObject[],
        values: FormValues,
        operation: SelectedOperationWithSpec | undefined,
    ) => void;
}

export const updateUiWithSelectedOperation = (
    operationId: string | undefined,
    prevSelectedOperationId: string | undefined,
    setPrevSelectedOperationId: Dispatch<SetStateAction<string | undefined>>,
): void => {
    if (prevSelectedOperationId) {
        const image = document.getElementById('picked_image_' + prevSelectedOperationId) as HTMLImageElement | null;
        if (image != null) {
            image.style.display = 'none';
        }
    }
    if (operationId) {
        const image = document.getElementById('picked_image_' + operationId) as HTMLImageElement | null;
        if (image != null) {
            image.style.display = 'block';
        }
        setPrevSelectedOperationId(operationId);
    }
};

// ======================== Service Component ==============================================
export const Services: React.FC<ServicePickerProps> = ({
    element,
    commandStack,
    bpmnFactory,
    showPickOptions,
    saved,
    cancelled,
    getPickedOperation,
    onPicked,
}) => {
    const [swaggerSpecs, setSwaggerSpecs] = useState<OpenAPIObject[]>([]);
    const [parameterModalState, setParameterModalState] = useState<ModalState>(initialModalState);
    const [selectedOperation, setSelectedOperation] = useState<SelectedOperationWithSpec | undefined>();
    const [prevSelectedOperationInfo, setPrevSelectedOperationInfo] = useState<PickedOperationInfo | undefined>();
    const [prevSelectedOperationId, setPrevSelectedOperationId] = useState<string | undefined>();

    const updateSelectedOperation = (
        service: OpenAPIObject,
        operationId: string,
        method: string,
        path: string,
        reqBodyContentType: string | null,
        pathMapping: ParameterMapping | null,
        queryMapping: ParameterMapping | null,
        outputMapping: ParameterMapping | null,
        reqBodyMapping: ParameterMapping | null,
    ): void => {
        setSelectedOperation((prev) => ({
            serviceId: service.id,
            operationId: operationId,
            method: method,
            path: path,
            swaggerSpec: service,
            reqBodyContentType: reqBodyContentType,
            pathMapping: pathMapping === null ? prev?.pathMapping || {} : pathMapping,
            queryMapping: queryMapping === null ? prev?.queryMapping || {} : queryMapping,
            outputMapping: outputMapping === null ? prev?.outputMapping || {} : outputMapping,
            reqBodyMapping: reqBodyMapping === null ? prev?.reqBodyMapping || {} : reqBodyMapping,
        }));
    };

    const fetchSwaggerApi = async (): Promise<void> => {
        const specs = await getSwaggerSpecsList();
        const filteredSpecs = specs.filter((spec) => spec.success !== false);
        setSwaggerSpecs(filteredSpecs);
    };

    useEffect(() => {
        fetchSwaggerApi().then(() => console.log('fetched API spec'));
    }, []);

    useEffect(() => {
        const po: PickedOperationInfo | undefined = getPickedOperation();
        setPrevSelectedOperationInfo(po);
    }, [getPickedOperation, swaggerSpecs]);

    useEffect(() => {
        if (prevSelectedOperationInfo) {
            updateUiWithSelectedOperation(prevSelectedOperationInfo.operationId, undefined, setPrevSelectedOperationId);
        }
    }, [prevSelectedOperationInfo]);

    useEffect(() => {
        if (saved && selectedOperation) {
            let sellectedPanelIndex: null | number = null;
            swaggerSpecs.forEach((swaggerSpec, index) => {
                if (
                    swaggerSpec?.paths?.[selectedOperation?.path]?.[selectedOperation?.method]?.operationId ===
                    selectedOperation.operationId
                ) {
                    sellectedPanelIndex = index;
                }
            });
            onPicked({
                serviceId: selectedOperation.serviceId,
                operationId: selectedOperation.operationId,
                method: selectedOperation.method,
                path: selectedOperation.path,
                sellectedPanelIndex: sellectedPanelIndex,
                reqBodyContentType: selectedOperation.reqBodyContentType,
                pathMapping: selectedOperation.pathMapping,
                queryMapping: selectedOperation.queryMapping,
                outputMapping:
                    selectedOperation?.outputMapping && selectedOperation?.outputMapping?.output
                        ? JSON.parse(selectedOperation?.outputMapping?.output as string)
                        : {},
                reqBodyMapping: selectedOperation.reqBodyMapping,
            });
            const inputOutputElement = inputOutputHelper.getInputOutput(element, true);
            // const apiIdDetails = elementHelper.createElement(
            //     'camunda:InputParameter',
            //     { name: 'apiId', value: selectedOperation.serviceId },
            //     inputOutputElement,
            //     bpmnFactory,
            // );
            const operationIdDetails = elementHelper.createElement(
                'camunda:InputParameter',
                { name: 'operationId', value: selectedOperation.operationId },
                inputOutputElement,
                bpmnFactory,
            );
            const selectionInfo = cmdHelper.addAndRemoveElementsFromList(
                element,
                inputOutputElement,
                'inputParameters',
                'inputOutput',
                [
                    // apiIdDetails,
                    operationIdDetails,
                ],
                [],
            );
            commandStack.execute(selectionInfo.cmd, selectionInfo.context);
        }
    }, [swaggerSpecs, onPicked, saved, cancelled, selectedOperation, element, commandStack, bpmnFactory]);

    const onSelectOperation = (service: OpenAPIObject, operationId: string, method: string, path: string): void => {
        updateSelectedOperation(service, operationId, method, path, null, null, null, null, null);
        show(setParameterModalState);
    };

    const onSaveParameterMapping = (
        parameters: ExtendedParameterObject[],
        values: FormValues,
        operation: SelectedOperationWithSpec | undefined,
    ): void => {
        const { ...mapping } = values.data;

        if (!operation) {
            throw new Error('Illegal state. Unknown operation.');
        }

        const reqBodyContent = operation.swaggerSpec?.paths[operation.path][operation.method]?.requestBody?.content;
        const reqBodyContentType = reqBodyContent ? Object.keys(reqBodyContent)[0] : null;

        const pathMapping = parameters
            .filter((p) => p.in === 'path')
            .reduce(
                (prev, p) => ({
                    ...prev,
                    [p.name]: mapping[p.name],
                }),
                {},
            );

        const queryMapping = parameters
            .filter((p) => p.in === 'query')
            .reduce(
                (prev, p) => ({
                    ...prev,
                    [p.name]: mapping[p.name],
                }),
                {},
            );

        const outputMapping = parameters
            .filter((p) => p.in === 'output')
            .reduce(
                (prev, p) => ({
                    ...prev,
                    [p.name]: mapping[p.name].replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ''),
                }),
                {},
            );

        const reqBodyMapping = parameters
            .filter((p) => p.in === 'reqBody')
            .reduce(
                (prev, p) => ({
                    ...prev,
                    [p.name]: mapping[p.name].replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ''),

                    payloadSchema: mapping.payloadSchema,
                }),
                {},
            );

        setSelectedOperation({
            ...operation,
            reqBodyContentType: reqBodyContentType,
            pathMapping: pathMapping,
            queryMapping: queryMapping,
            outputMapping: outputMapping,
            reqBodyMapping: reqBodyMapping,
        });

        hide(setParameterModalState);
        updateUiWithSelectedOperation(operation.operationId, prevSelectedOperationId, setPrevSelectedOperationId);
    };

    const cancelParameterMapping = (): void => {
        setSelectedOperation(undefined);
        cancel(setParameterModalState);
    };

    return (
        <>
            {swaggerSpecs.length ? (
                <div>
                    <PluginPopup
                        title={'Input/Output Parameters Mapping'}
                        size="sm"
                        onShow={parameterModalState.show}
                        onClose={cancelParameterMapping}>
                        <ParameterMapper
                            operation={selectedOperation}
                            prevOperation={prevSelectedOperationInfo}
                            onSaveParameterMapping={onSaveParameterMapping}
                        />
                    </PluginPopup>
                    <Accordion
                        allowMultipleExpanded
                        allowZeroExpanded
                        preExpanded={
                            prevSelectedOperationInfo?.sellectedPanelIndex
                                ? [prevSelectedOperationInfo?.sellectedPanelIndex]
                                : []
                        }>
                        {swaggerSpecs.map((spec, index) => {
                            const swaggerUrl: string = process.env.REACT_APP_API_GATEWAY_URL as string;
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            spec.servers[0] = { ...spec.servers[0], url: swaggerUrl };
                            return (
                                <AccordionItem key={index} uuid={index}>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>{spec.info.title}</AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <SwaggerUI
                                            spec={spec}
                                            requestInterceptor={(req): HeadersObject => {
                                                req.headers.Authorization = `Bearer ${sessionStorage.getItem(
                                                    'react-token',
                                                )}`;
                                                return req;
                                            }}
                                            plugins={
                                                showPickOptions ? [PickServicePlugin(spec, onSelectOperation)] : []
                                            }
                                            docExpansion={'list'}
                                        />
                                    </AccordionItemPanel>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            ) : (
                <p className="text-center"> Fetching swagger list...</p>
            )}
        </>
    );
};

// ===========================================

export const prepareResponseStructure = (schema: SchemaObject, schemas: SchemasObject | undefined): SchemaObject => {
    if (typeof schema === 'object' && !Array.isArray(schema)) {
        for (const objKey of Object.keys(schema)) {
            const element = schema[objKey];
            if (element.type) {
                if (element.type !== 'object') {
                    schema[objKey] = '';
                }
            }
            if (typeof element === 'object') {
                prepareResponseStructure(element, schemas);
            } else if (objKey === REF_KEY) {
                const schemaRef = element.replace(componentsRef, '');
                if (schemas) {
                    const properties = schemas[schemaRef]?.properties || [];
                    Object.keys(properties).forEach((property) => (schema[property] = properties[property]));
                }
                delete schema[objKey];
                prepareResponseStructure(schema, schemas);
            }
        }
    } else if (Array.isArray(schema)) {
        schema.forEach((item) => prepareResponseStructure(item, schemas));
    }
    return schema;
};

const httpMethods: Set<string> = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

export const getOperation = (paths: PathsObject, operationId: string): OperationObject => {
    const items: PathItemObject[] = Object.values(paths);
    const escapedId = operationId.replace(/[^\w]/gi, '_');

    const candidates: OperationObject[] = items
        .map(
            (item) =>
                Object.keys(item)
                    .filter((m) => httpMethods.has(m))
                    .map((m) => item[m]) as OperationObject[],
        )
        .flatMap((o) => o)
        .filter((o) => o.operationId === operationId || o.operationId === escapedId);

    if (candidates.length === 1) {
        return candidates[0];
    }

    if (candidates.length > 1) {
        throw new Error(
            'Multiple operations found with ID ' + operationId + '. Reach out to the API owners to fix this',
        );
    }

    throw new Error('Unknown Operation ' + operationId);
};

const componentsRef = '#/components/schemas/';
const mediaTypes: string[] = ['application/json', '*/*', 'multipart/form-data'];

const getSchema = (content?: ContentObject, allSchemas?: SchemasObject): SchemaObject | undefined => {
    if (content && allSchemas) {
        const mto: MediaTypeObject[] = mediaTypes.map((m) => content[m]).filter((s) => !!s);
        if (mto.length > 0) {
            const schema: ReferenceObject | SchemaObject | undefined = mto[0].schema;
            const properties = (schema as SchemaObject)?.properties;
            if (properties) {
                return schema;
            }
            if (schema?.$ref) {
                const refSchema: SchemaObject | undefined = allSchemas[schema.$ref.replace(componentsRef, '')];
                if (refSchema.properties) {
                    return refSchema;
                }
            }
        }
    }
    return undefined;
};

const getRequestSchema = (
    allSchemas: SchemasObject | undefined,
    operation: OperationObject,
): SchemaObject | undefined => {
    return getSchema((operation?.requestBody as RequestBodyObject | undefined)?.content, allSchemas);
};

const getResponseSchema = (
    allSchemas: SchemasObject | undefined,
    operation: OperationObject,
): SchemaObject | undefined => {
    return getSchema(operation?.responses['200'].content, allSchemas);
};

const REF_KEY = '$ref';

export const getParameters = async (selected: SelectedOperationWithSpec): Promise<ExtendedParameterObject[]> => {
    const swaggerSpec = selected.swaggerSpec;

    const operation: OperationObject = getOperation(swaggerSpec.paths, selected.operationId);
    const parameters: ExtendedParameterObject[] = [...(operation.parameters || [])] as ParameterObject[];

    const requestSchema: SchemaObject | undefined = getRequestSchema(swaggerSpec.components?.schemas, operation);
    const responseSchema: SchemaObject | undefined = getResponseSchema(swaggerSpec.components?.schemas, operation);

    if (requestSchema && requestSchema.properties) {
        const formattedSchema: FormattedSchema = {};
        const formattedReqObj = {};

        Object.keys(requestSchema.properties).forEach((item) => {
            const property: SchemaObject | undefined = requestSchema.properties?.[item];
            if (property) {
                if (property.example || typeof property.example === 'boolean') {
                    formattedReqObj[item] = property.example;
                } else if (property.enum) {
                    formattedReqObj[item] = property.enum[0];
                } else if (property.type === 'integer') {
                    formattedReqObj[item] = 0;
                } else if (property.type === 'boolean') {
                    formattedReqObj[item] = false;
                } else {
                    formattedReqObj[item] = '';
                }
                formattedSchema[item] = property.type ? property.type : 'string';
            }
        });

        parameters.push({
            name: 'payload',
            in: 'reqBody',
            required: true,
            default: JSON.stringify(formattedReqObj, null, 2),
            schema: formattedSchema,
        });
    }

    const formattedResObj = responseSchema
        ? prepareResponseStructure(responseSchema, swaggerSpec?.components?.schemas)
        : {};

    parameters.push({
        name: 'output',
        in: 'output',
        required: true,
        default: JSON.stringify(formattedResObj.properties, null, 2),
        schema: {},
    });

    return parameters;
};

const getInputSchema = (
    parameter: ExtendedParameterObject,
    selectedOperation: PickedOperationInfo | undefined,
): FormioSchema | TextArea[] | undefined => {
    let label = '';
    const rows = 6;
    let defaultValue = '';
    if (parameter.in === 'path' || parameter.in === 'query') {
        if (parameter.in === 'path') {
            label = `Path Parameter : ${parameter.name}`;
            defaultValue = selectedOperation ? (selectedOperation.pathMapping[parameter.name] as string) : '';
        } else if (parameter.in === 'query') {
            label = `Query Parameter : ${parameter.name}`;
            defaultValue = selectedOperation ? (selectedOperation.queryMapping[parameter.name] as string) : '';
        }
        return getTextFieldSchema(parameter.name, label, parameter.required, parameter.name, defaultValue, '');
    } else if (parameter.in === 'reqBody' || parameter.in === 'output') {
        if (parameter.in === 'reqBody') {
            label = 'Request Body';
            defaultValue = selectedOperation?.reqBodyMapping
                ? JSON.stringify(JSON.parse(selectedOperation?.reqBodyMapping.payload as string), null, 2)
                : parameter.default
                ? parameter.default
                : '{}';
        } else if (parameter.in === 'output') {
            label = 'Response Body';
            defaultValue = selectedOperation?.outputMapping
                ? JSON.stringify(selectedOperation?.outputMapping, null, 2)
                : parameter.default
                ? parameter.default
                : '{}';
        }
        return [
            getTextAreaSchema(parameter.name, label, parameter.required, parameter.name, defaultValue, '', rows),
            getTextAreaSchema(
                `${parameter.name}Schema`,
                `${label} Schema`,
                parameter.required,
                parameter.name,
                parameter.schema ? JSON.stringify(parameter.schema, null, 2) : '',
                '',
                rows,
                false,
                true,
            ),
        ];
    }
    return undefined;
};

export const ParameterMapper: React.FC<ParameterMapperProps> = ({
    operation,
    prevOperation,
    onSaveParameterMapping,
}) => {
    const componentArray: unknown[] = [];
    const formioRef = useRef(null);
    const [parameters, setParameters] = useState<ExtendedParameterObject[]>([]);
    const selectedOperation = operation?.operationId === prevOperation?.operationId ? prevOperation : undefined;

    useEffect(() => {
        if (operation) {
            getParameters(operation).then((p) => setParameters(p));
        }
    }, [operation]);

    if (parameters && parameters.length) {
        parameters.forEach((p) => {
            const inputSchema = getInputSchema(p, selectedOperation);
            if (Array.isArray(inputSchema)) {
                const arr = inputSchema;
                arr.forEach((a) => componentArray.push(a));
            } else {
                componentArray.push(inputSchema as TextArea);
            }
        });
        componentArray.push(submitButtonSchema('OK'));
    }

    const form = {
        display: 'form',
        components: componentArray,
    };

    return (
        <Form
            form={form}
            ref={formioRef}
            onSubmit={(values: FormValues): void => onSaveParameterMapping(parameters, values, operation)}
        />
    );
};
