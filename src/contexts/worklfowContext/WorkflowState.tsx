import { UPDATE_WORKFLOW_TABLE, TABLE_INITIAL_STATE } from 'constants/actions';
import React, { useReducer } from 'react';
import WorkflowContext from './workflow-context';
import worfklowReducer from './workflow-reducer';

const WorkflowState = ({ children }) => {
    const [workflowState, dispatch] = useReducer(worfklowReducer, TABLE_INITIAL_STATE);

    const updateWorkflowTableData = (data) => {
        dispatch({ type: UPDATE_WORKFLOW_TABLE, payload: data });
    };

    return (
        <WorkflowContext.Provider
            value={{ workflowTableData: workflowState, updateWorkflowTableData: updateWorkflowTableData }}>
            {children}
        </WorkflowContext.Provider>
    );
};

export default WorkflowState;
