import React, { useState, useEffect } from 'react';
import PluginPopup, { initialModalState, ModalState, cancel, save, show } from './PluginPopup';
import { BpmnFactory, CommandStack, ModelerElement } from 'camunda-modeler-types';
import FormPicker from './plugin/formPicker';
import ServicePicker from './plugin/servicePicker';
export interface PluginModalsProps {
    bpmnFactory: BpmnFactory;
    commandStack: CommandStack;
}

const noop = (): void => {
    //np
};

export let openFormPicker: (element: ModelerElement) => void = noop;
export let openServicePicker: (element: ModelerElement) => void = noop;

export const PluginModals: React.FC<PluginModalsProps> = ({ bpmnFactory, commandStack }) => {
    const [element, setElement] = React.useState<ModelerElement | undefined>();
    const [formPickerModalState, setFormPickerModalState] = useState<ModalState>(initialModalState);
    const [servicePickerModalState, setServicePickerModalState] = useState<ModalState>(initialModalState);
    const [appData, setAppData]: any = useState({});

    openFormPicker = (el): void => {
        setElement(el);
        show(setFormPickerModalState);
    };

    openServicePicker = (el): void => {
        setElement(el);
        show(setServicePickerModalState);
    };

    useEffect(() => {
        getAppData();
    }, []);

    const getAppData = () => {
        if (Object.keys(appData).length === 0) {
            fetch(
                !document.getElementById('WorkflowMFE-container')
                    ? '../process/config.json'
                    : '../model/process/config.json',
            )
                .then((r) => r.json())
                .then((config) => {
                    setAppData(config);
                    console.log('plugin config', config);
                });
        }
    };

    return element ? (
        <>
            <PluginPopup
                title="Pick a Form/Component"
                size="lg"
                onShow={formPickerModalState.show}
                onClose={(): void => cancel(setFormPickerModalState)}
                onSave={(): void => save(setFormPickerModalState)}>
                <FormPicker
                    appData={appData}
                    element={element}
                    bpmnFactory={bpmnFactory}
                    commandStack={commandStack}
                    saved={formPickerModalState.saved}
                    cancelled={formPickerModalState.cancelled}
                />
            </PluginPopup>
            <PluginPopup
                title="List of Swagger Endpoints"
                size="lg"
                onShow={servicePickerModalState.show}
                onClose={(): void => cancel(setServicePickerModalState)}
                onSave={(): void => save(setServicePickerModalState)}>
                <ServicePicker
                    appData={appData}
                    element={element}
                    bpmnFactory={bpmnFactory}
                    commandStack={commandStack}
                    saved={servicePickerModalState.saved}
                    cancelled={servicePickerModalState.cancelled}
                />
            </PluginPopup>
        </>
    ) : null;
};
