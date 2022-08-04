import React, { Dispatch, SetStateAction } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, IconButton } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import ActionButton from 'components/common/actionButton';

interface PluginPopupProps {
    title?: string;
    onShow: boolean;
    onClose: () => void;
    onSave?: () => void;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
}

export interface ModalState {
    show: boolean;
    saved: boolean;
    cancelled: boolean;
}

export const initialModalState: ModalState = {
    show: false,
    saved: false,
    cancelled: false,
};

export const show = (setState: Dispatch<SetStateAction<ModalState>>): void =>
    setState({
        show: true,
        saved: false,
        cancelled: false,
    });

export const hide = (setState: Dispatch<SetStateAction<ModalState>>): void =>
    setState({
        show: false,
        saved: false,
        cancelled: false,
    });

export const save = (setState: Dispatch<SetStateAction<ModalState>>): void =>
    setState({
        show: false,
        saved: true,
        cancelled: false,
    });

export const cancel = (setState: Dispatch<SetStateAction<ModalState>>): void =>
    setState({
        show: false,
        saved: false,
        cancelled: true,
    });

const useStyles = makeStyles((theme) => ({
    dialogWrapper: {
        padding: 10,
    },
    dialogTitle: {
        margin: 0,
        padding: 5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dialogContent: {
        padding: 10,
        overflowX: 'hidden',
    },
    closeButton: {
        height: 30,
        width: 30,
    },
}));

const PluginPopup: React.FC<PluginPopupProps> = ({ title, size, fullWidth, children, onShow, onClose, onSave }) => {
    const classes = useStyles();

    const handleSave = () => {
        onClose();
        onSave && onSave();
    };

    return (
        <Dialog
            open={onShow}
            fullWidth={fullWidth || true}
            maxWidth={size || 'md'}
            classes={{ paper: classes.dialogWrapper }}>
            <DialogTitle className={classes.dialogTitle}>
                <Typography variant="h5">{title || ''}</Typography>
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose} size="large">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>{children}</DialogContent>
            {onSave && (
                <DialogActions>
                    <ActionButton variant="secondary" onClick={onClose}>
                        Cancel
                    </ActionButton>
                    <ActionButton variant="primary" onClick={handleSave}>
                        Save
                    </ActionButton>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default PluginPopup;
