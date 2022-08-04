declare module 'bpmn-js-properties-panel';
declare module 'bpmn-js/lib/util/ModelUtil';
declare module 'bpmn-js-properties-panel/lib/helper/CmdHelper';
declare module 'bpmn-js-properties-panel/lib/provider/camunda';
declare module 'bpmn-js-properties-panel/lib/helper/ElementHelper';
declare module 'bpmn-js-properties-panel/lib/helper/InputOutputHelper';

declare module 'camunda-dmn-moddle/resources/camunda';

declare module 'react-formio';
declare module 'styled-components';
declare module 'file-saver';
declare module 'diagram-js-minimap';
declare module 'react-router-redux';
declare module 'redux-mock-store';
declare module 'bpmn-js/lib/Modeler' {
    interface SaveSvgResult {
        svg: string;
    }

    interface SaveXmlOpts {
        format?: boolean;
    }

    interface SaveXmlResult {
        xml: string;
    }

    export interface BpmnModelerType {
        new (any);

        importXML: (string) => Promise<unknown>;
        saveSVG: () => Promise<SaveSvgResult>;
        saveXML: (opts: SaveXmlOpts) => Promise<SaveXmlResult>;
    }

    const BpmnModeler: BpmnModelerType;

    export default BpmnModeler;
}

declare module 'bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider' {
    import { BpmnFactory, ModelerElement, CommandStack } from 'camunda-modeler-types';

    export interface TabGroupEntry {
        id: string;
        html: string;
        description?: string;
        cssClasses?: string[];
        onAction?: (element: ModelerElement) => void;
        onLookup?: (element: ModelerElement) => void;
    }

    export interface TabGroup {
        id: string;
        label: string;
        entries: TabGroupEntry[];
    }

    export interface Tab {
        id: string;
        groups: TabGroup[];
    }

    export interface CamundaBPMNPropertiesProviderType {
        new (
            eventBus: EventBus,
            canvas: Canvas,
            bpmnFactory: BpmnFactory,
            elementRegistry: ElementRegistry,
            elementTemplates: ElementTemplates,
            translate: Translate,
            commandStack: CommandStack,
        );

        getTabs: (element: ModelerElement) => Tab[];
    }

    const BPMNPropertiesProvider: CamundaBPMNPropertiesProviderType;

    export default BPMNPropertiesProvider;
}

declare module 'camunda-modeler-types' {
    export interface EventBus {
        [key: string]: unknown;
    }

    export interface Canvas {
        [key: string]: unknown;
    }

    export interface ElementRegistry {
        [key: string]: unknown;
    }

    export interface ElementTemplates {
        [key: string]: unknown;
    }

    export interface Translate {
        [key: string]: unknown;
    }

    export interface BpmnFactory {
        [key: string]: unknown;
    }

    export interface ModelerElement {
        name?: string;
        get?: () => unknown;
    }
    export interface Command {
        cmd: string;
        context: unknown;
    }

    export interface CommandStack {
        execute: (cmd: string, context: unknown) => void;
    }
}
