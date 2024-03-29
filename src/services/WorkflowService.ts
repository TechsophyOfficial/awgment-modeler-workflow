import { request, ResponseProps } from '../request';
import { ProcessProps, SaveProcessResponse } from 'components/workflowModeler';
import { WORKFLOW_DEPLOY, WORKFLOW_ENDPOINT } from 'constants/endpoints';

interface Id {
    id: string;
}
export interface WorkflowInstance {
    content: string;
    createdOn: Date;
    id: string;
    name: string;
    updatedById: string;
    updatedOn: Date;
    version: number;
}

export interface WorkflowProps {
    totalElements: number;
    page: number;
    size: number;
    content: WorkflowInstance[] | [];
}

export interface WorkflowReqProps {
    paginate: boolean;
    rowsPerPage?: number;
    page?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    searchTerm?: string;
    apiGatewayUrl?: string;
}

export type Action = 'add' | 'update' | 'delete' | 'activate' | 'deactivate';
export type Decision = 'approve' | 'reject';

// export const GET_WORKFLOW_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${WORKFLOW_ENDPOINT}`;
// export const DEPLOY_WORKFLOW_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${WORKFLOW_DEPLOY}`;

// API calls for Workflow

export const getAllWorkflows = async ({
    paginate = true,
    rowsPerPage = 10,
    page = 1,
    sortBy = '',
    sortDirection = 'desc',
    searchTerm = '',
    apiGatewayUrl,
}: WorkflowReqProps): Promise<{ success: boolean; message?: string; data?: WorkflowProps | any }> => {
    const GET_WORKFLOW_ENDPOINT = `${apiGatewayUrl}${WORKFLOW_ENDPOINT}`;
    const sort = sortBy && sortDirection ? `&sort-by=${sortBy}:${sortDirection}` : '';
    const search = searchTerm ? `&q=${searchTerm}` : '';
    let URL = `${GET_WORKFLOW_ENDPOINT}?include-content=false`;

    if (!paginate) {
        URL += `${sort}${search}`;
        const r: ResponseProps = (await request.get(URL)) as ResponseProps;
        if (r.success) {
            return { success: true, message: r.message, data: r.data as any };
        }
    } else {
        URL += `&size=${rowsPerPage}&page=${page}${sort}${search}`;
        const r: ResponseProps = (await request.get(URL)) as ResponseProps;
        if (r.success) {
            const data: WorkflowProps = r.data as WorkflowProps;
            return { success: true, message: r.message, data: data };
        }
    }

    return { success: false, message: 'Unable to fetch workflows' };
};

export const getWorkflowDetails = async ({
    id,
    apiGatewayUrl,
}): Promise<{ success: boolean; data?: ProcessProps; message?: string }> => {
    const GET_WORKFLOW_ENDPOINT = `${apiGatewayUrl}${WORKFLOW_ENDPOINT}`;
    const r: ResponseProps = (await request.get(`${GET_WORKFLOW_ENDPOINT}/${id}`)) as ResponseProps;
    if (r && r.success) {
        const process = r.data as ProcessProps;
        return { success: r.success, data: process, message: r.message };
    }
    return { success: false };
};

export const saveWorkflow = async ({
    processDetails,
    apiGatewayUrl,
}): Promise<{ success: boolean; data?: SaveProcessResponse; message?: string }> => {
    const GET_WORKFLOW_ENDPOINT = `${apiGatewayUrl}${WORKFLOW_ENDPOINT}`;
    const r: ResponseProps = (await request.postForm(GET_WORKFLOW_ENDPOINT, processDetails)) as ResponseProps;
    if (r.success) {
        const process = r.data as SaveProcessResponse;
        return { success: r.success, data: process, message: r.message };
    }
    return { success: false };
};

export const deployWorkflow = async ({
    deploymentName,
    currentXml,
    apiGatewayUrl,
}): Promise<{ success: boolean; message?: string }> => {
    const DEPLOY_WORKFLOW_ENDPOINT = `${apiGatewayUrl}${WORKFLOW_DEPLOY}`;
    const blob = new Blob([currentXml]);
    const fileOfBlob = new File([blob], `${deploymentName}.bpmn`);
    const params = {
        name: deploymentName,
        file: fileOfBlob,
    };
    const res: ResponseProps = (await request.postForm(DEPLOY_WORKFLOW_ENDPOINT, params)) as ResponseProps;
    if (res.success) {
        return { success: res.success, message: res.message };
    }
    return { success: false, message: res.message };
};

export const deleteWorkflow = async ({ id, apiGatewayUrl }): Promise<{ success: boolean; message?: string }> => {
    const GET_WORKFLOW_ENDPOINT = `${apiGatewayUrl}${WORKFLOW_ENDPOINT}`;
    const res: ResponseProps = (await request.delete(`${GET_WORKFLOW_ENDPOINT}/${id}`)) as ResponseProps;
    if (res.success) {
        return { success: res.success, message: res.message };
    }
    return { success: false, message: res.message };
};
