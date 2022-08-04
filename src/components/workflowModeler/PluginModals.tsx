import React, { useState } from 'react';
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

    openFormPicker = (el): void => {
        setElement(el);
        show(setFormPickerModalState);
    };

    openServicePicker = (el): void => {
        setElement(el);
        show(setServicePickerModalState);
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
