import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import KeycloakWrapper from './KeycloakWrapper';

declare const window: any;

window.renderWorkflowMFE = (containerId: string, history, config) => {
    console.log(config);
    // fetch('../model/process/config.json')
    //     .then((r) => r.json())
    //     .then((config) => {
    ReactDOM.render(<App history={history} config={config} />, document.getElementById(containerId));
    // });

    serviceWorker.unregister();
};

window.unmountWorkflowMFE = (containerId: string) => {
    ReactDOM.unmountComponentAtNode(document.getElementById(containerId) as HTMLElement);
};

if (!document.getElementById('WorkflowMFE-container')) {
    fetch(`https://demo1691447.mockable.io/api/awgment/v1/tenants${window.location.pathname}`)
        .then((r) => r.json())
        .then((config) => {
            ReactDOM.render(<KeycloakWrapper config={config} />, document.getElementById('root'));
        });

    serviceWorker.unregister();
}
