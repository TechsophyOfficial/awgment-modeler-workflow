import { UPDATE_WORKFLOW_TABLE } from 'constants/actions';

const worflowReducer = (state, action) => {
    switch (action.type) {
        case UPDATE_WORKFLOW_TABLE:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

export default worflowReducer;
