import React, { Fragment } from 'react';
import { Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Form } from 'react-formio';
import DataList from 'tsf_datalist/dist/components/dataList';
import { FormDetails, SingleForm } from './FormTypes';
import { BACKGROUND_COLOR_2 } from 'theme/colors';
import TsfTaskTypes from 'component_workflow_tasktypes/dist/components/tsfTaskTypes';

interface TabPanelContentProps {
    records: FormDetails[];
    recordType: 'form' | 'component';
    activeRecordId: string;
    activeRecordDetails: SingleForm | null;
    emptyRecordsText: string;
    noActiveRecordText: string;
    onSelectRecord: ({ id }) => void;
    componentDetails?: any;
    setComponentDetails?: any;
}

const useStyles = makeStyles((theme) => ({
    panelPage: {
        marginTop: 10,
        display: 'flex',
        height: '60vh',
        overflow: 'none',
    },
    list: {
        width: 350,
        overflowX: 'hidden',
        minHeight: '60vh',
    },
    preview: {
        width: '100%',
        overflow: 'auto',
        backgroundColor: BACKGROUND_COLOR_2,
        padding: 15,
        minHeight: '60vh',
    },
}));

const TabPanelContent: React.FC<TabPanelContentProps> = ({
    records,
    recordType,
    activeRecordId,
    activeRecordDetails,
    emptyRecordsText,
    noActiveRecordText,
    onSelectRecord,
    componentDetails,
    setComponentDetails,
}) => {
    const classes = useStyles();

    //code to render Form and components

    const renderContent = () => {
        if (activeRecordId && activeRecordDetails?.type === recordType && recordType === 'form') {
            return <Form form={activeRecordDetails?.components} options={{ readOnly: true }} />;
        } else if (activeRecordId && activeRecordDetails?.type === recordType && recordType === 'component') {
            return (
                <Fragment>
                    <h4 className="text-center">{activeRecordDetails?.name} Preview</h4>
                    <TsfTaskTypes
                        type={activeRecordDetails?.name}
                        formState={componentDetails}
                        setFormState={setComponentDetails}
                    />
                </Fragment>
            );
        } else {
            return <h5 className="text-center">{noActiveRecordText}</h5>;
        }
        // return <h4 className="text-center">{activeRecordDetails?.name} Preview</h4>;
        // return <h5 className="text-center">{noActiveRecordText}</h5>;
    };

    return (
        <div>
            {records.length ? (
                <Paper className={classes.panelPage}>
                    <div className={classes.list}>
                        <DataList
                            data={{ records: records }}
                            activeTaskId={activeRecordId}
                            rowClicked={onSelectRecord}
                        />
                    </div>
                    <div className={classes.preview}>{renderContent()}</div>
                </Paper>
            ) : (
                <h5 className="text-center">{emptyRecordsText}</h5>
            )}
        </div>
    );
};

export default TabPanelContent;
