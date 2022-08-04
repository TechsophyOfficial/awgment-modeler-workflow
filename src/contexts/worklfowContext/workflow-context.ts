import { createContext } from 'react';
import { WorkflowInstance } from 'services/WorkflowService';

export interface WorkflowTable {
    searchBy: string;
    rowsPerPageOptions: number[];
    recordsCount: number;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    records: WorkflowInstance[] | [];
}

export interface WorkflowContextProps {
    workflowTableData: WorkflowTable;
    updateWorkflowTableData: (data: WorkflowTable) => void;
}

const WorkflowContext = createContext({} as WorkflowContextProps);

export default WorkflowContext;
