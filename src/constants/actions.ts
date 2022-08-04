import { createTheme } from '@mui/material/styles';
import { DataTableProps } from 'tsf_datalist/dist/components/dataList/types';

// Actions
export const OPEN_SPINNER = 'OPEN_SPINNER';
export const CLOSE_SPINNER = 'CLOSE_SPINNER';
export const PUSH_NOTIFICATION = 'PUSH_NOTIFICATION';
export const SHOW_CONFIRMATION = 'SHOW_CONFIRMATION';
export const UPDATE_THEME = 'UPDATE_THEME';
export const HIDE_LAYOUT = 'HIDE_LAYOUT';
export const MINIMIZE_LAYOUT = 'MINIMIZE_LAYOUT';
export const MAXIMIZE_LAYOUT = 'MAXIMIZE_LAYOUT';
// table actions
export const UPDATE_WORKFLOW_TABLE = 'UPDATE_WORKFLOW_TABLE';
export const ADD_TAB = 'ADD_TAB';
export const UPDATE_TAB = 'UPDATE_TAB';
export const CLOSE_TAB = 'CLOSE_TAB';
export const UPDATE_ACTIVE_TAB_INDEX = 'UPDATE_ACTIVE_TAB_INDEX';

export const INITIAL_THEME = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            // main: colors.indigo[500],
            main: '#201e45',
            light: '#95CBF7',
        },
        secondary: {
            // main: colors.indigo[500]
            main: '#000',
        },
        error: {
            main: '#201e45',
        },
    },
});

export const INITIAL_LAYOUT = {
    isHidden: false,
    isMinimized: false,
    isMaximized: true,
};

// table initial states
export const TABLE_INITIAL_STATE: DataTableProps = {
    rowsPerPageOptions: [5, 10, 20, 25],
    recordsCount: 0,
    page: 1,
    rowsPerPage: 5,
    sortBy: '',
    sortDirection: 'desc',
    records: [],
};
export const INITIAL_TAB = {
    tabs: [],
    activeTabIndex: 0,
};
