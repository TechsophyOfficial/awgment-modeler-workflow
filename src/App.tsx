import React from 'react';
import Wrapper from 'wrapper';
import ContextProvider from 'ContextProvider';
import ThemeProvider from 'contexts/themeContext/ThemeState';
import Layout from 'components/layout';
import { StylesProvider, createGenerateClassName } from '@mui/styles';
import { StyledEngineProvider } from '@mui/material';
import AppConfig from './appConfig.js';

const App = ({ config, history }): React.ReactElement => {
    const generateClassName = createGenerateClassName({
        // disableGlobal: true,
        // productionPrefix: 'prod_workflow_mfe-',
        seed: 'workflowMFE',
    });

    return (
        <StyledEngineProvider injectFirst>
            <StylesProvider generateClassName={generateClassName}>
                <AppConfig.Provider value={config}>
                    <ThemeProvider>
                        <ContextProvider>
                            <Wrapper>
                                <Layout />
                            </Wrapper>
                        </ContextProvider>
                    </ThemeProvider>
                </AppConfig.Provider>
            </StylesProvider>
        </StyledEngineProvider>
    );
};

export default App;
