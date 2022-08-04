import { createContext } from 'react';

export interface NotificationProps {
    isOpen: boolean;
    type?: 'error' | 'info' | 'success' | 'warning';
    message?: string;
    handleClose?: () => void;
}

export interface NotificationContextProps {
    notification: NotificationProps;
    pushNotification: (data: NotificationProps) => void;
}

const NotificationContext = createContext({} as NotificationContextProps);

export default NotificationContext;
