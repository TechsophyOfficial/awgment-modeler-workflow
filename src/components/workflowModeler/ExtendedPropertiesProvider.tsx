import React from 'react';
import ReactDOM from 'react-dom';
import { PluginModals, openFormPicker, openServicePicker } from './PluginModals';
import {
    BpmnFactory,
    Canvas,
    CommandStack,
    ElementRegistry,
    ElementTemplates,
    EventBus,
    ModelerElement,
    Translate,
} from 'camunda-modeler-types';
import DMNPropertiesProvider, {
    CamundaBPMNPropertiesProviderType,
    Tab,
    TabGroupEntry,
} from 'bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import inputOutputHelper from 'bpmn-js-properties-panel/lib/helper/InputOutputHelper';

interface Parameter {
    name?: string;
    $type?: string;
    value: string;
}

const rulesConnector = 'rules-connector';
const apiMarketplaceConnector = 'rest-connector';
class ExtendedPropertiesProvider {
    static $inject = [
        'eventBus',
        'canvas',
        'bpmnFactory',
        'elementRegistry',
        'elementTemplates',
        'translate',
        'commandStack',
    ];
    private camunda: CamundaBPMNPropertiesProviderType;
    constructor(
        eventBus: EventBus,
        canvas: Canvas,
        bpmnFactory: BpmnFactory,
        elementRegistry: ElementRegistry,
        elementTemplates: ElementTemplates,
        translate: Translate,
        commandStack: CommandStack,
    ) {
        this.camunda = new DMNPropertiesProvider(
            eventBus,
            canvas,
            bpmnFactory,
            elementRegistry,
            elementTemplates,
            translate,
            commandStack,
        );
        if (!document.getElementById('plugins-root')) {
            const pluginRoot = document.createElement('div');
            pluginRoot.setAttribute('id', 'plugins-root');
            ReactDOM.render(<PluginModals bpmnFactory={bpmnFactory} commandStack={commandStack} />, pluginRoot);
        }
    }

    public getTabs = (element: ModelerElement): Tab[] =>
        this.camunda.getTabs(element).map((item) => {
            if (item.id === 'forms') {
                return this.getFormsTab(element, item);
            } else if (item.id === 'connector') {
                return this.getConnectorTab(element, item);
            } else if (item.id === 'extensionElements') {
                return this.getExtensionTab(item);
            } else if (item.id === 'general') {
                return this.getGeneralTab(element, item);
            }

            return item;
        });

    private getFormsTab = (element: ModelerElement, formsTab: Tab): Tab => {
        if (formsTab.groups.length > 0 && formsTab.groups[0].entries.length > 0) {
            if (is(element, 'bpmn:UserTask')) {
                const formTabEntries: TabGroupEntry[] = [];
                formTabEntries.push({
                    html: `<div> 
                              <button id='preview-button' class='preview-button' data-action='onLookup'>Pick a Form/Component</button>
                          </div>`,
                    id: 'form-fields-builder-button',
                    onLookup: (el: ModelerElement): void => openFormPicker(el),
                });
                formsTab.groups[0].entries.forEach((tabItem) => formTabEntries.push(tabItem));
                formsTab.groups[0].entries = formTabEntries;
            } else formsTab.groups[0].entries = [];
        }
        return formsTab;
    };

    private getGeneralTab = (element: ModelerElement, generalTab: Tab): Tab => {
        if (is(element, 'bpmn:Process')) {
            const id = 'id';
            const processDefinitionkeyField = {
                id: id,
                label: 'Id',
                description: 'This maps to the process definition key.',
                modelProperty: id,
                disabled: (): boolean => true,
            };
            generalTab.groups[0].entries[0] = entryFactory.textField(processDefinitionkeyField);
        }
        return generalTab;
    };

    private getExtensionTab = (extensionTab: Tab): Tab => {
        extensionTab.groups = [];
        return extensionTab;
    };

    private getConnectorTab = (element: ModelerElement, connectorTab: Tab): Tab => {
        if (is(element, 'bpmn:ServiceTask')) {
            setConnectorId(element, apiMarketplaceConnector);
            const operationIdProp = 'operationId';
            const lookupIcon = {
                html: `<button id='preview-button' class='preview-button' data-action='onLookup'>Lookup APIs</button>`,
                id: 'lookup-button',
                onLookup: (el: ModelerElement): void => openServicePicker(el),
            };
            const operationIdField = {
                id: operationIdProp,
                label: 'Selected Operation ID',
                modelProperty: operationIdProp,
                get: (el: ModelerElement): { [operationIdProp]: string } => ({
                    [operationIdProp]: getProperty(el, operationIdProp),
                }),
                disabled: (): boolean => true,
            };
            connectorTab.groups = [
                {
                    ...connectorTab.groups[0],
                    entries: [
                        ...connectorTab.groups[0].entries,
                        lookupIcon,
                        // entryFactory.textField(apiIdField),
                        entryFactory.textField(operationIdField),
                    ],
                },
                ...connectorTab.groups,
            ];
        }
        // else {
        //     connectorTab.groups = [];
        // }
        return connectorTab;
    };
}

export const setConnectorId = (element: ModelerElement, newId: string): void => {
    const connector = inputOutputHelper?.getConnector(element);
    if (connector) {
        const existing = connector.connectorId;
        if (
            !existing ||
            newId === rulesConnector ||
            (newId === apiMarketplaceConnector && existing === rulesConnector)
        ) {
            connector.connectorId = newId;
        }
    }
};

export const getProperty = (element: ModelerElement, propName: string): string => {
    const connectorElement = inputOutputHelper.getConnector(element);
    if (connectorElement?.inputOutput?.inputParameters) {
        const inputParameters: Parameter[] = connectorElement.inputOutput.inputParameters;
        const nameParam: Parameter[] = inputParameters.filter((parameter: Parameter) => parameter.name === propName);
        if (nameParam.length > 0) {
            return nameParam[0].value;
        }
    }
    return '';
};

export default {
    __init__: ['propertiesProvider'],
    propertiesProvider: ['type', ExtendedPropertiesProvider],
};
