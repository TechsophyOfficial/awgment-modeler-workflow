import React, { useContext, useEffect, useRef, useState } from 'react';
import './styles/PropertiesPanel.less';
import './styles/index.scss';
import { Button, TextField } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BpmnModeler, { BpmnModelerType } from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import ExtendedPropertiesProvider from './ExtendedPropertiesProvider';
import minimapModule from 'diagram-js-minimap';
import XMLViewer from 'react-xml-viewer';
import { saveAs } from 'file-saver';
import TabContext, { Tab } from 'contexts/tabContext/tab-context';
import makeStyles from '@mui/styles/makeStyles';
import { FILE_SAVER_PREFIX, PROPERTY_PANEL_WIDTH, TOPBAR_HEIGHT } from 'constants/common';
import { WHITE } from 'theme/colors';
import ActionButton from 'components/common/actionButton';
import ActionMenu from './ActionMenu';
import Popup from 'tsf_popup/dist/components/popup';
import { deleteWorkflow, deployWorkflow, saveWorkflow } from 'services/WorkflowService';
import SpinnerContext from 'contexts/spinnerContext/spinner-context';
import NotificationContext from 'contexts/notificationContext/notification-context';
import ConfirmationContext from 'contexts/confirmationContext/confirmation-context';

import AppConfig from '../../appConfig.js';

interface Id {
    id: string;
}

export interface SaveProcessResponse extends Id {
    version: number;
}
interface InitialProcess {
    name: string;
}

interface SaveProcessProps extends InitialProcess {
    content: string;
}
export interface ProcessProps extends SaveProcessProps, SaveProcessResponse {}

interface FormState {
    name: string;
    version: string;
    deploymentName: string;
}

type XML = string;

interface SaveBPMN {
    xml: XML;
}

interface FormFieldProps {
    label: string;
    name: string;
    inputType?: string;
    required?: boolean;
    disabled?: boolean;
}

interface WorkflowModelerProps {
    tab: Tab;
    loadRecords: () => void;
}

const WorkflowModeler: React.FC<WorkflowModelerProps> = ({ tab, loadRecords }) => {
    const propertiesPanel = useRef(null);
    const canvas = useRef(null);
    const { content } = tab;
    const {
        tabsList: { tabs },
        updateTab,
        closeTab,
    } = useContext(TabContext);
    const { pushNotification } = useContext(NotificationContext);
    const { openSpinner, closeSpinner } = useContext(SpinnerContext);
    const { confirmation, showConfirmation } = useContext(ConfirmationContext);

    const [BPMNmodeler, setBPMNModeler] = useState<BpmnModelerType | undefined>();
    const [openPropertyPanel, setOpenPropertyPanel] = useState<boolean>(false);
    const [viewWorkflow, setViewWorkflow] = useState<boolean>(false);
    const [currentXML, setCurrentXML] = useState<XML>('');
    const [openFormModal, setOpenFormModal] = useState<boolean>(false);
    const [isDeploy, setIsDeploy] = useState<boolean>(false);
    const [formState, setFormState] = useState<FormState>({
        name: '',
        version: '',
        deploymentName: '',
    });

    const appData: any = useContext(AppConfig);
    const apiGatewayUrl = appData.apiGatewayUrl;
    console.log('111111', apiGatewayUrl);

    const useStyles = makeStyles((theme) => ({
        root: {
            width: '100%',
            display: 'flex',
        },
        canvasWrapper: {
            width: openPropertyPanel ? `calc(100% - ${PROPERTY_PANEL_WIDTH}px)` : '100%',
        },
        canvas: {
            height: '100%',
            '& .djs-palette-entries': {
                width: 100,
            },
            '& .djs-minimap': {
                cursor: 'pointer',
                position: 'absolute',
                borderRight: 'none',
                top: 110,
                right: 0,
                zIndex: 100,
                '& .map': {
                    width: 150,
                    height: 100,
                },
                '&:not(.open) .toggle': {
                    width: 38,
                    height: 37,
                },
            },
            '& .bjs-powered-by': {
                display: 'none',
            },
        },
        actionButtonsWrapper: {
            position: 'absolute',
            right: 10,
            marginTop: 13,
            zIndex: 10,
        },
        actionButton: {
            marginRight: 10,
        },
        formButton: {
            marginLeft: 10,
        },
        propertyPanelWrapper: {
            marginTop: 60,
            position: 'absolute',
            height: 'calc(100% - 76px)',
            display: 'flex',
            right: '10px',
        },
        propertyPanel: {
            position: 'relative',
            height: '100%',
            width: PROPERTY_PANEL_WIDTH,
            border: `1px solid #ccc`,
            borderRadius: 0,
            overflow: 'auto',
            display: openPropertyPanel ? 'block' : 'none',
        },
        propertyPanelToggle: {
            height: TOPBAR_HEIGHT,
            minWidth: TOPBAR_HEIGHT,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            color: WHITE,
            backgroundColor: theme.palette.secondary.main,
            '&:hover': {
                backgroundColor: theme.palette.secondary.main,
                opacity: '0.9',
            },
        },
        formField: {
            marginTop: 10,
            marginBottom: 15,
        },
        formActionButtonWrapper: {
            display: 'flex',
            justifyContent: 'flex-end',
        },
    }));

    const classes = useStyles();

    useEffect(() => {
        const bpmnModeler: BpmnModelerType = new BpmnModeler({
            container: canvas.current,
            propertiesPanel: {
                parent: propertiesPanel.current,
            },
            additionalModules: [
                minimapModule,
                propertiesPanelModule,
                propertiesProviderModule,
                ExtendedPropertiesProvider,
            ],
            moddleExtensions: {
                camunda: camundaModdleDescriptor,
            },
        });
        setBPMNModeler(bpmnModeler);
        bpmnModeler.importXML(content);
        // eslint-disable-next-line
    }, []);

    const generateCurrentXml = async (): Promise<string> => {
        const { xml } = (await BPMNmodeler?.saveXML({ format: true })) as SaveBPMN;
        return xml;
    };

    const viewHandler = async () => {
        const xml = await generateCurrentXml();
        setCurrentXML(xml);
        setViewWorkflow(true);
    };

    const importHandler = async (file) => {
        const processXML = await file.text();
        updateTab({ ...tab, name: file.name, content: processXML });
        await BPMNmodeler?.importXML(processXML);
    };

    const exportHandler = async () => {
        const xml = await generateCurrentXml();
        saveAs(`${FILE_SAVER_PREFIX},${encodeURIComponent(xml)}`, `${tab.name}.bpmn`);
    };

    const handleSaveOrDeploy = async (deployState = false) => {
        const xml = await generateCurrentXml();
        setCurrentXML(xml);
        setIsDeploy(deployState);
        setFormState({ ...formState, name: tab.name, version: tab.version || '', deploymentName: '' });
        setOpenFormModal(true);
    };

    const onSaveWorkflow = async (): Promise<void> => {
        const { id } = tab;
        const gatewayUrl = apiGatewayUrl;
        const { name } = formState;
        let processData: SaveProcessProps | ProcessProps = {
            name: name,
            content: currentXML,
        };

        if (id) {
            processData = {
                ...processData,
                id: id,
            };
        }

        openSpinner();
        const { success, data, message } = await saveWorkflow({
            processDetails: processData,
            apiGatewayUrl: gatewayUrl,
        });
        if (success && data) {
            const { id: newId, version } = data;
            setOpenFormModal(false);
            updateTab({ ...tab, id: newId, version: version.toString(), name });
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message || 'Workflow saved successfully',
                type: 'success',
            });
            loadRecords();
        } else {
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message || 'Unable to save workflow',
                type: 'error',
            });
        }
    };

    const onDeployWorkflow = async (): Promise<void> => {
        if (tab.id) {
            const { deploymentName } = formState;
            const gatewayUrl = apiGatewayUrl;
            openSpinner();
            const { success } = await deployWorkflow({
                deploymentName: deploymentName,
                currentXml: currentXML,
                apiGatewayUrl: gatewayUrl,
            });
            closeSpinner();
            setOpenFormModal(false);
            if (success) {
                pushNotification({
                    isOpen: true,
                    message: 'Process deployed successfully',
                    type: 'success',
                });
            } else {
                pushNotification({
                    isOpen: true,
                    message: 'Failed to deploy',
                    type: 'error',
                });
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLElement>): void => {
        event.preventDefault();
        updateTab({ ...tab, content: currentXML });
        isDeploy ? onDeployWorkflow() : onSaveWorkflow();
    };

    const onDeleteWorkflow = async (): Promise<void> => {
        if (tab.id) {
            const gatewayUrl = apiGatewayUrl;
            openSpinner();
            const { success = false, message } = await deleteWorkflow({ id: tab.id, apiGatewayUrl: gatewayUrl });
            if (success) {
                showConfirmation({
                    ...confirmation,
                    isOpen: false,
                });
                closeSpinner();
                const foundIndex = tabs.findIndex((x) => x.key === tab.key);
                closeTab(foundIndex);
                pushNotification({
                    isOpen: true,
                    message: message || 'Process deleted successfully',
                    type: 'success',
                });
                loadRecords();
            } else {
                closeSpinner();
                pushNotification({
                    isOpen: true,
                    message: message || 'We are facing an internal issue, Please try again later',
                    type: 'error',
                });
            }
        }
    };

    const renderModelerCanvas = (): React.ReactElement => {
        return (
            <div className={classes.canvasWrapper}>
                <div className={classes.actionButtonsWrapper}>
                    <ActionButton
                        variant="primary"
                        buttonProps={{ id: 'workflow_save_button', className: classes.actionButton }}
                        onClick={() => handleSaveOrDeploy()}>
                        Save
                    </ActionButton>
                    {tab.id && (
                        <>
                            <ActionButton
                                variant="secondary"
                                buttonProps={{ id: 'workflow_deploy_button', className: classes.actionButton }}
                                onClick={() => handleSaveOrDeploy(true)}>
                                Deploy
                            </ActionButton>
                            <ActionButton
                                variant="secondary"
                                buttonProps={{ id: 'workflow_delete_button', className: classes.actionButton }}
                                onClick={() =>
                                    showConfirmation({
                                        ...confirmation,
                                        isOpen: true,
                                        title: 'Are you sure,Do you want to delete?',
                                        subTitle: 'Please confirm if you want to delete this particular workflow',
                                        confirmButtonLabel: 'Delete',
                                        onConfirm: () => onDeleteWorkflow(),
                                    })
                                }>
                                Delete
                            </ActionButton>
                        </>
                    )}
                    <ActionMenu viewHandler={viewHandler} importHandler={importHandler} exportHandler={exportHandler} />
                </div>
                <div className={classes.canvas} id="js-canvas" ref={canvas} />
            </div>
        );
    };

    const renderPropertiesPanel = (): React.ReactElement => {
        return (
            <div className={classes.propertyPanelWrapper}>
                <Button
                    className={classes.propertyPanelToggle}
                    onClick={() => setOpenPropertyPanel(!openPropertyPanel)}>
                    {openPropertyPanel ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </Button>
                <div className={classes.propertyPanel} ref={propertiesPanel} />
            </div>
        );
    };

    const renderPopup = (): React.ReactElement => {
        return (
            <>
                <Popup onShow={viewWorkflow} onClose={() => setViewWorkflow(false)}>
                    <XMLViewer xml={currentXML} />
                </Popup>
            </>
        );
    };

    const onInputChange = (statename: string, event): void => {
        const { value } = event.target;
        setFormState({
            ...formState,
            [statename]: value,
        });
    };

    const renderFormDetails = ({
        label,
        name,
        required = false,
        disabled = false,
    }: FormFieldProps): React.ReactElement => {
        return (
            <TextField
                id="workflow-popup-input"
                className={classes.formField}
                label={label}
                name={name}
                size="small"
                variant="outlined"
                required={required}
                disabled={disabled}
                fullWidth
                value={formState[name]}
                onChange={(event): void => onInputChange(name, event)}
            />
        );
    };

    const renderFormModal = (): React.ReactElement => {
        return (
            <Popup
                title={isDeploy ? 'Deploy Workflow' : 'Save Workflow'}
                onShow={openFormModal}
                size="xs"
                onClose={() => setOpenFormModal(false)}>
                <form autoComplete="off" onSubmit={handleSubmit}>
                    {!isDeploy &&
                        renderFormDetails({
                            label: 'Name',
                            name: 'name',
                            required: true,
                        })}
                    {!isDeploy &&
                        tab.id &&
                        renderFormDetails({
                            label: 'Version',
                            name: 'version',
                            disabled: true,
                        })}
                    {isDeploy &&
                        renderFormDetails({
                            label: 'Deployment Name',
                            name: 'deploymentName',
                            required: true,
                        })}
                    <div className={classes.formActionButtonWrapper}>
                        <ActionButton
                            variant="secondary"
                            buttonProps={{ id: 'workflow_popup_cancel_button', className: classes.formButton }}
                            onClick={(): void => setOpenFormModal(false)}>
                            Cancel
                        </ActionButton>
                        <ActionButton
                            variant="primary"
                            buttonProps={{
                                id: `workflow_popup_${isDeploy ? 'deploy' : 'save'}_button`,
                                className: classes.formButton,
                                type: 'submit',
                            }}>
                            {isDeploy ? 'Deploy' : 'Save'}
                        </ActionButton>
                    </div>
                </form>
            </Popup>
        );
    };

    return (
        <div className={classes.root}>
            {renderModelerCanvas()}
            {renderPropertiesPanel()}
            {renderPopup()}
            {renderFormModal()}
        </div>
    );
};

export default WorkflowModeler;
