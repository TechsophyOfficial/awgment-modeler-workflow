import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Tab } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { BpmnFactory, CommandStack, ModelerElement, Command } from 'camunda-modeler-types';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { getAllFormsAndComponents, getFormOrComponentDetails } from 'services/PluginServices';
import { FormDetails, SingleForm } from './FormTypes';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TabPanelContent from './TabPanelContent';
import { getProperties } from 'components/workflowModeler/ModelerUtils';
import AppConfig from '../../../../appConfig.js';

interface FormPickerProps {
    element: ModelerElement;
    commandStack: CommandStack;
    bpmnFactory: BpmnFactory;
    saved?: boolean;
    cancelled?: boolean;
}

const useStyles = makeStyles((theme) => ({
    root: {
        borderBottom: '2px solid #ccc',
    },
    tab: {
        marginRight: 10,
        border: '2px solid #ccc',
        borderBottom: 'none',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    activeTab: {
        backgroundColor: (theme.hasOwnProperty('palette') && theme.palette.primary.main) || '#f17b7b',
    },
    tabPanel: {
        padding: 0,
        margin: 0,
    },
}));

const FormPicker: React.FC<FormPickerProps> = ({ element, bpmnFactory, commandStack, saved, cancelled }) => {
    const classes = useStyles();

    const bo = getBusinessObject(element);
    const initialFormId = bo.get('formKey');
    const [activeTabValue, setActiveTabValue] = React.useState<string>('1');
    const [formId, setFormId] = useState<string>(initialFormId);
    const [allForms, setAllForms] = useState<FormDetails[]>([]);
    const [allComponents, setAllComponents] = useState<FormDetails[]>([]);
    const [formDetails, setFormDetails] = useState<SingleForm | null>(null);
    const [componentDetails, setComponentDetails] = useState<any>();
    const [customComponent, setCustomComponent] = useState<boolean>(false);

    const appData: any = useContext(AppConfig);
    const apiGatewayUrl = appData.apiGatewayUrl;

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
        setActiveTabValue(newValue);
    };

    const fetchAllFormsAndComponents = useCallback(async (apiGatewayUrl): Promise<void> => {
        const { success = false, data }: { success: boolean; data?: FormDetails[] } = await getAllFormsAndComponents(
            apiGatewayUrl,
        );
        if (success && data) {
            const forms = data.filter((form) => form.type === 'form');
            const components = data.filter((component) => component.type === 'component');
            setAllForms(forms);
            setAllComponents(components);
        }
    }, []);

    const getFormDetails = async (id: string): Promise<void> => {
        if (apiGatewayUrl) {
            const gatewayUrl = apiGatewayUrl;
            const { success, data } = await getFormOrComponentDetails({ id: id, apiGatewayUrl: gatewayUrl });
            if (success && data) {
                if (data.hasOwnProperty('components') && data.components.hasOwnProperty('state')) {
                    setComponentDetails(data.components.state);
                    setCustomComponent(true);
                }
                setFormId(id);
                setFormDetails(data);
            }
        }
    };
    useEffect(() => {
        if (apiGatewayUrl) fetchAllFormsAndComponents(apiGatewayUrl);
    }, [fetchAllFormsAndComponents]);

    useEffect(() => {
        getProperties(element, bpmnFactory, commandStack);
    }, [bpmnFactory, element, commandStack]);

    useEffect(() => {
        if (saved) {
            const extensionElements = bo.get('extensionElements');
            const extensionProperties = extensionElements?.values?.filter((elem: ModelerElement) =>
                is(elem, 'camunda:Properties'),
            )[0];
            const commands: Command[] = [];
            commands.push(
                cmdHelper.updateBusinessObject(element, bo, {
                    formKey: formId,
                }),
            );
            if (extensionProperties) {
                const versionNameProperties = extensionProperties?.values?.filter(
                    (elem: ModelerElement) => is(elem, 'camunda:Property') && elem.name === 'formVersion',
                );
                const FormNameProperty = extensionProperties?.values?.filter(
                    (elem: ModelerElement) => is(elem, 'camunda:Property') && elem.name === 'formName',
                );
                const FormTypeProperty = extensionProperties?.values?.filter(
                    (elem: ModelerElement) => is(elem, 'camunda:Property') && elem.name === 'type',
                );
                const FormisDefaultProperty = extensionProperties?.values?.filter(
                    (elem: ModelerElement) => is(elem, 'camunda:Property') && elem.name === 'isDefault',
                );

                const newVersionNameProperty = elementHelper.createElement(
                    'camunda:Property',
                    { name: 'formVersion', value: 'latest' },
                    extensionProperties,
                    bpmnFactory,
                );
                const newFormNameProperty = elementHelper.createElement(
                    'camunda:Property',
                    { name: 'formName', value: formDetails?.name },
                    extensionProperties,
                    bpmnFactory,
                );
                const newFormTypeProperty = elementHelper.createElement(
                    'camunda:Property',
                    { name: 'type', value: formDetails?.type },
                    extensionProperties,
                    bpmnFactory,
                );
                const newFormisDefaultProperty = elementHelper.createElement(
                    'camunda:Property',
                    { name: 'isDefault', value: formDetails?.isDefault },
                    extensionProperties,
                    bpmnFactory,
                );
                //Fliter to remove duplicate values
                const CustomDataProperty = extensionProperties?.values?.filter(
                    (elem: ModelerElement) =>
                        (is(elem, 'camunda:Property') && elem.name === 'negativeAnswer') ||
                        elem.name === 'negativeQuestion' ||
                        elem.name === 'positiveAnswer' ||
                        elem.name === 'executionRule' ||
                        elem.name === 'algorithm' ||
                        elem.name === 'assignmentRule' ||
                        elem.name === 'question' ||
                        elem.name === 'confirmationButtonLabel' ||
                        elem.name === 'checklistId' ||
                        elem.name === 'checklistButtonLabel' ||
                        elem.name === 'screenType' ||
                        elem.name === 'screenTypeId' ||
                        elem.name === 'validationButtonLabel' ||
                        elem.name === 'documentTypeId' ||
                        elem.name === 'documentGenerationButtonLabel' ||
                        elem.name === 'approveButtonLabel' ||
                        elem.name === 'rejectButtonLabel' ||
                        elem.name === 'conditionalApprovalButtonLabel' ||
                        elem.name === 'reviewButtonLabel' ||
                        elem.name === 'auto-input',
                );

                commands.push(
                    cmdHelper.removeElementsFromList(
                        element,
                        extensionProperties,
                        'values',
                        'properties',
                        CustomDataProperty,
                    ),
                );

                if (customComponent) {
                    const newFormDataProperty = Object.entries(componentDetails).map(([key, value]: [any, any]) => {
                        if (value) {
                            return elementHelper.createElement(
                                'camunda:Property',
                                { name: key, value: value.hasOwnProperty('id') ? value.id : value },
                                extensionProperties,
                                bpmnFactory,
                            );
                        } else {
                            return elementHelper.createElement(
                                'camunda:Property',
                                { name: key, value: '' },
                                extensionProperties,
                                bpmnFactory,
                            );
                        }
                    });
                    commands.push(
                        cmdHelper.addAndRemoveElementsFromList(
                            element,
                            extensionProperties,
                            'values',
                            'properties',
                            newFormDataProperty,
                        ),
                    );
                }

                commands.push(
                    cmdHelper.addAndRemoveElementsFromList(
                        element,
                        extensionProperties,
                        'values',
                        'properties',
                        [newFormNameProperty],
                        versionNameProperties,
                    ),
                );
                commands.push(
                    cmdHelper.addAndRemoveElementsFromList(
                        element,
                        extensionProperties,
                        'values',
                        'properties',
                        [newVersionNameProperty],
                        FormNameProperty,
                    ),
                );
                commands.push(
                    cmdHelper.addAndRemoveElementsFromList(
                        element,
                        extensionProperties,
                        'values',
                        'properties',
                        [newFormTypeProperty],
                        FormTypeProperty,
                    ),
                );
                commands.push(
                    cmdHelper.addAndRemoveElementsFromList(
                        element,
                        extensionProperties,
                        'values',
                        'properties',
                        [newFormisDefaultProperty],
                        FormisDefaultProperty,
                    ),
                );
            }

            if (commands.length > 0) {
                commands.forEach((ccc: Command) => commandStack.execute(ccc.cmd, ccc.context));
            }
        }
        if (cancelled) {
            if (initialFormId) {
                const fKey = cmdHelper.updateBusinessObject(element, bo, {
                    formKey: initialFormId,
                });
                commandStack.execute(fKey.cmd, fKey.context);
            }
        }
    }, [bpmnFactory, commandStack, element, saved, cancelled, bo, formId, initialFormId, formDetails]);

    return (
        <TabContext value={activeTabValue}>
            <TabList
                className={classes.root}
                classes={{ indicator: classes.activeTab }}
                onChange={handleChange}
                aria-label="simple tabs">
                <Tab className={classes.tab} label="Forms" value="1" />
                <Tab className={classes.tab} label="Components" value="2" />
            </TabList>
            <TabPanel className={classes.tabPanel} value="1">
                <TabPanelContent
                    records={allForms}
                    recordType="form"
                    activeRecordId={formId}
                    activeRecordDetails={formDetails}
                    emptyRecordsText="Form list is empty"
                    noActiveRecordText="No form selected"
                    onSelectRecord={({ id }) => getFormDetails(id)}
                />
            </TabPanel>
            <TabPanel className={classes.tabPanel} value="2">
                <TabPanelContent
                    records={allComponents}
                    recordType="component"
                    activeRecordId={formId}
                    activeRecordDetails={formDetails}
                    emptyRecordsText="Component list is empty"
                    noActiveRecordText="No component selected"
                    onSelectRecord={({ id }) => getFormDetails(id)}
                    componentDetails={componentDetails}
                    setComponentDetails={setComponentDetails}
                />
            </TabPanel>
        </TabContext>
    );
};

export default FormPicker;
