import React, { useCallback, useContext, useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import LayoutContext from 'contexts/layoutContext/layout-context';
import TabContext from 'contexts/tabContext/tab-context';
import { BACKGROUND_COLOR, WHITE } from 'theme/colors';
import DataList from 'tsf_datalist/dist/components/dataList';
import BrowserTabs from 'components/browserTabs';
import { DRAWER_WIDTH, TOPBAR_HEIGHT } from 'constants/common';
import { getAllWorkflows, getWorkflowDetails } from 'services/WorkflowService';
import SpinnerContext from 'contexts/spinnerContext/spinner-context';
import NotificationContext from 'contexts/notificationContext/notification-context';
import getNewBPMNDiagram from 'constants/newBPMNDiagram';
import EmptyCardLayout from 'tsf_empty_card/dist/components/emptyCardLayout';
import { ProcessProps } from 'components/workflowModeler';

import AppConfig from '../../../../appConfig.js';

const MinimizeView = () => {
    const {
        layout: { isHidden, isMinimized },
    } = useContext(LayoutContext);

    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
            width: '100%',
            position: 'relative',
        },
        sidebar: {
            backgroundColor: WHITE,
            width: `${isMinimized ? `${DRAWER_WIDTH}px` : 0}`,
            display: `${isHidden ? 'none' : 'block'}`,
            minHeight: '100%',
            overflowX: 'hidden',
            overflowY: 'scroll',
            '&::-webkit-scrollbar': {
                width: '6px',
                display: 'block',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme?.palette?.primary.main,
            },
        },
        content: {
            flexGrow: 1,
            marginTop: -TOPBAR_HEIGHT,
            marginLeft: `${isHidden ? `${TOPBAR_HEIGHT}px` : '0px'}`,
            width: `${isMinimized ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%'}`,
            backgroundColor: BACKGROUND_COLOR,
        },
        emptyCard: {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    }));

    const classes = useStyles();
    const { openSpinner, closeSpinner } = useContext(SpinnerContext);
    const {
        tabsList: { tabs, activeTabIndex },
        addTab,
    } = useContext(TabContext);
    const [workflowTableData, updateWorkflowTableData] = useState([]);
    const { pushNotification } = useContext(NotificationContext);
    const { processName, newBPMNDiagram } = getNewBPMNDiagram();

    const appData: any = useContext(AppConfig);
    const apiGatewayUrl: string = appData.apiGatewayUrl;

    const fetchAllWorkflows = useCallback(
        async (gatewayUrl = apiGatewayUrl) => {
            openSpinner();
            const apiGatewayUrl = gatewayUrl;
            const {
                success,
                data,
                message = '',
            } = await getAllWorkflows({ paginate: false, sortBy: 'updatedOn', apiGatewayUrl });
            closeSpinner();
            if (success && data) {
                updateWorkflowTableData(data);
            } else {
                pushNotification({
                    isOpen: true,
                    message: message,
                    type: 'error',
                });
            }
        },
        [openSpinner, closeSpinner, pushNotification],
    );

    useEffect(() => {
        if (apiGatewayUrl) fetchAllWorkflows(apiGatewayUrl);
        // eslint-disable-next-line
    }, []);

    const handleSearch = async (searchTerm: string): Promise<void> => {
        const { success, data } = await getAllWorkflows({ paginate: false, searchTerm: searchTerm });
        if (success && data) {
            updateWorkflowTableData(data);
        }
    };

    const getProcessDetails = async (id: string, gatewayUrl = apiGatewayUrl): Promise<void> => {
        openSpinner();
        const { success, message, data } = await getWorkflowDetails({ id: id, apiGatewayUrl: gatewayUrl });
        if (success && data) {
            const { name, version, content }: ProcessProps = data;
            const decodedWorkflowContent = atob(content);
            closeSpinner();
            addTab({
                key: processName,
                id: id,
                name: name,
                version: version.toString(),
                content: decodedWorkflowContent,
            });
        } else {
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message || 'Unable to fetch workflow',
                type: 'error',
            });
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.sidebar}>
                <DataList
                    data={{ records: workflowTableData }}
                    showCreateNewButton={true}
                    showSearchFeild={true}
                    activeTaskId={tabs[activeTabIndex]?.id}
                    handleCreateNew={() =>
                        addTab({
                            key: processName,
                            name: processName,
                            content: newBPMNDiagram,
                        })
                    }
                    handleSearch={(event) => handleSearch(event?.target?.value)}
                    rowClicked={({ id }) => getProcessDetails(id)}
                />
            </div>
            <div className={classes.content}>
                {tabs.length ? (
                    <BrowserTabs loadRecords={fetchAllWorkflows} />
                ) : (
                    <div className={classes.emptyCard}>
                        <EmptyCardLayout
                            title="Get started with Workflow Modeler"
                            description="Build a series of tasks & decisions that make up your business process"
                            handleCreateNew={() =>
                                addTab({
                                    key: processName,
                                    name: processName,
                                    content: newBPMNDiagram,
                                })
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinimizeView;
