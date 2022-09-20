import React from 'react';
import { BpmnFactory, CommandStack, ModelerElement } from 'camunda-modeler-types';
import { getPickedOperationProperty, RuleOperationInfo, setPickedOperationProperty } from '../../ModelerUtils';
import { PickedOperationInfo, Services } from './Services';

interface ServicePickerProps {
    appData: any;
    element: ModelerElement;
    bpmnFactory: BpmnFactory;
    commandStack: CommandStack;
    saved: boolean;
    cancelled: boolean;
}

const ServicePicker: React.FC<ServicePickerProps> = ({
    appData,
    element,
    bpmnFactory,
    commandStack,
    saved,
    cancelled,
}) => (
    <Services
        appData={appData}
        element={element}
        commandStack={commandStack}
        bpmnFactory={bpmnFactory}
        showPickOptions={true}
        getPickedOperation={(): (PickedOperationInfo & RuleOperationInfo) | undefined =>
            getPickedOperationProperty(element, bpmnFactory, commandStack)
        }
        onPicked={(picked): void => {
            setPickedOperationProperty(element, bpmnFactory, commandStack, picked);
        }}
        saved={saved}
        cancelled={cancelled}
    />
);

export default ServicePicker;
