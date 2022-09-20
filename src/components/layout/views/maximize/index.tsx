import React, { useContext, useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { BACKGROUND_COLOR, BACKGROUND_COLOR_2 } from 'theme/colors';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import VersionPopup from 'components/version';
import LayoutContext from 'contexts/layoutContext/layout-context';
import { TOPBAR_HEIGHT, ACTION_DELETE, ACTION_EDIT, TABLE_HEADERS } from 'constants/common';
import ConfirmationContext from 'contexts/confirmationContext/confirmation-context';
import { deleteWorkflow, getAllWorkflows, getWorkflowDetails } from 'services/WorkflowService';
import NotificationContext from 'contexts/notificationContext/notification-context';
import SpinnerContext from 'contexts/spinnerContext/spinner-context';
import TabContext from 'contexts/tabContext/tab-context';
import getNewBPMNDiagram from 'constants/newBPMNDiagram';
import Popup from 'tsf_popup/dist/components/popup';
import DataList from 'tsf_datalist/dist/components/dataList';
import { ProcessProps } from 'components/workflowModeler';
import WorkflowContext from 'contexts/worklfowContext/workflow-context';

import AppConfig from '../../../../appConfig.js';

const actions = [
    {
        actionId: ACTION_EDIT,
        actionName: 'Edit',
        actionIcon: EditOutlined,
    },
    {
        actionId: ACTION_DELETE,
        actionName: 'Delete',
        actionIcon: DeleteOutlined,
    },
];

const MaximizeView = () => {
    const [versionOpen, setVersionOpen] = useState(false);
    const { minimizeLayout } = useContext(LayoutContext);
    const { confirmation, showConfirmation } = useContext(ConfirmationContext);
    const { pushNotification } = useContext(NotificationContext);
    const { openSpinner, closeSpinner } = useContext(SpinnerContext);
    const {
        tabsList: { tabs },
        addTab,
        closeTab,
    } = useContext(TabContext);
    const { workflowTableData, updateWorkflowTableData } = useContext(WorkflowContext);
    const { processName, newBPMNDiagram } = getNewBPMNDiagram();
    const { rowsPerPage, sortBy, sortDirection, page } = workflowTableData;

    const appData: any = useContext(AppConfig);
    const apiGatewayUrl = appData.apiGatewayUrl;

    useEffect(() => {
        fetchAllWorkflows(rowsPerPage, page);
        // eslint-disable-next-line
    }, []);

    const useStyles = makeStyles(() => ({
        root: {
            backgroundColor: BACKGROUND_COLOR,
            minHeight: `calc(100% - ${TOPBAR_HEIGHT}px)`,
        },
        versionPopup: {
            '& .MuiDialog-paper': {
                backgroundColor: BACKGROUND_COLOR_2,
            },
        },
    }));

    const classes = useStyles();

    const fetchAllWorkflows = async (
        noOfRows,
        pageNo,
        orderBy = sortBy,
        orderDirection = sortDirection,
        gatewayUrl = apiGatewayUrl,
    ) => {
        openSpinner();
        const {
            success,
            data,
            message = '',
        } = await getAllWorkflows({
            paginate: true,
            rowsPerPage: noOfRows,
            page: pageNo,
            sortBy: orderBy,
            sortDirection: orderDirection,
            apiGatewayUrl: gatewayUrl,
        });
        closeSpinner();
        if (success && data) {
            const { totalElements, size, page: currentPage, content } = data;
            const updateData = {
                recordsCount: totalElements,
                page: currentPage,
                rowsPerPage: size,
                records: content,
                sortBy: orderBy,
                sortDirection: orderDirection,
            };
            updateWorkflowTableData({
                ...workflowTableData,
                ...updateData,
            });
        } else {
            pushNotification({
                isOpen: true,
                message: message,
                type: 'error',
            });
        }
    };

    const handleVersionClicked = (e: string) => {
        setVersionOpen(false);
        minimizeLayout();
    };

    const getProcessDetails = async (id: string, gatewayUrl = apiGatewayUrl): Promise<void> => {
        openSpinner();
        const { success, message, data } = await getWorkflowDetails({ id: id, apiGatewayUrl: gatewayUrl });
        if (success && data) {
            const { name, version, content }: ProcessProps = data;
            const decodedWorkflowContent = atob(content);
            closeSpinner();
            minimizeLayout();
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

    const deleteWorfklow = async (id: string) => {
        openSpinner();
        const gatewayUrl = apiGatewayUrl;
        const { success, message } = await deleteWorkflow({ id: id, apiGatewayUrl: gatewayUrl });
        if (success) {
            showConfirmation({
                ...confirmation,
                isOpen: false,
            });
            await fetchAllWorkflows(rowsPerPage, page);
            const foundIndex = tabs.findIndex((x) => x.id === id);
            closeTab(foundIndex);
            pushNotification({
                isOpen: true,
                message: message ? message : '',
                type: 'success',
            });
            closeSpinner();
        } else {
            closeSpinner();
            pushNotification({
                isOpen: true,
                message: message ? message : '',
                type: 'error',
            });
        }
    };

    const actionClicked = (e: string, id: string, gatewayUrl = apiGatewayUrl) => {
        if (e === ACTION_EDIT) {
            getProcessDetails(id, gatewayUrl);
        } else if (e === ACTION_DELETE) {
            showConfirmation({
                ...confirmation,
                isOpen: true,
                title: 'Are you sure,Do you want to delete?',
                subTitle: 'Please confirm if you want to delete this particular workflow',
                confirmButtonLabel: 'Delete',
                onConfirm: () => deleteWorfklow(id),
            });
        }
    };

    const handleChangePage = (e, newPage) => {
        fetchAllWorkflows(rowsPerPage, newPage + 1);
    };

    const handleChangeRowsPerPage = async (event) => {
        const selectedRowPerPage = parseInt(event.target.value, 10);
        await fetchAllWorkflows(selectedRowPerPage, 1);
    };

    const handleSortRequest = async (cellId) => {
        const isAsc = sortBy === cellId && sortDirection === 'asc' ? 'desc' : 'asc';
        await fetchAllWorkflows(rowsPerPage, 1, cellId, isAsc);
    };

    const handleSearch = async (searchTerm: string): Promise<void> => {
        const { success, data } = await getAllWorkflows({ paginate: false, searchTerm: searchTerm, apiGatewayUrl });
        if (success && data) {
            const updateData = { records: data };
            updateWorkflowTableData({
                ...workflowTableData,
                ...updateData,
            });
        }
    };

    return (
        <div className={classes.root}>
            <DataList
                data={workflowTableData}
                title="Workflow List"
                columns={TABLE_HEADERS}
                maxView={true}
                showCreateNewButton={true}
                showSearchFeild={true}
                actions={actions}
                actionClicked={(e, id) => actionClicked(e, id)}
                rowClicked={({ id, apiGatewayUrl }) => getProcessDetails(id, apiGatewayUrl)}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                handleSortRequest={handleSortRequest}
                handleSearch={(event) => handleSearch(event?.target?.value)}
                handleCreateNew={() => {
                    minimizeLayout();
                    addTab({
                        key: processName,
                        name: processName,
                        content: newBPMNDiagram,
                    });
                }}
            />
            <Popup size="xs" title={'Recommended Versions'} onShow={versionOpen} onClose={() => setVersionOpen(false)}>
                <VersionPopup id={'1'} onVersionClicked={handleVersionClicked} />
            </Popup>
        </div>
    );
};

export default MaximizeView;
