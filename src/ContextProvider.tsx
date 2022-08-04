import React, { useContext, useEffect } from 'react';
import ThemeContext from 'contexts/themeContext/theme-context';
import ConfirmationState from 'contexts/confirmationContext/ConfirmationState';
import NotificationState from 'contexts/notificationContext/NotificationState';
import SpinnerState from 'contexts/spinnerContext/SpinnerState';
import LayoutState from 'contexts/layoutContext/LayoutState';
import { getSelectedTheme, ThemeProps } from 'services/ThemeService';
import WorkflowState from 'contexts/worklfowContext/WorkflowState';
import TabState from 'contexts/tabContext/TabState';
import { ThemeProvider, Theme } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material';

declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}

const ContextProvider: React.FC = ({ children }) => {
    const { theme, updateTheme } = useContext(ThemeContext);

    useEffect(() => {
        const setTheme = async () => {
            const selectedThemeRes = await getSelectedTheme();
            if (selectedThemeRes.success) {
                const selectedTheme = selectedThemeRes.data as ThemeProps;
                updateTheme(selectedTheme);
            }
        };
        setTheme();
        // eslint-disable-next-line
    }, []);
    console.log(theme);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <SpinnerState>
                    <ConfirmationState>
                        <NotificationState>
                            <LayoutState>
                                <WorkflowState>
                                    <TabState>{children}</TabState>
                                </WorkflowState>
                            </LayoutState>
                        </NotificationState>
                    </ConfirmationState>
                </SpinnerState>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default ContextProvider;
