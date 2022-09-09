import { getWorkflowDetails } from '../WorkflowService';
import { request } from '../../request';
import { WORKFLOW_ENDPOINT } from 'constants/endpoints';
import { useContext } from 'react';
import AppConfig from '../../appConfig.js';

jest.mock('../../request');

const mockedRequest = request as jest.Mocked<typeof request>;
// const appData: any = useContext(AppConfig);
// const apiGatewayUrl = appData.apiGatewayUrl;
const apiGatewayUrl = 'google.com';

const GET_WORKFLOW_ENDPOINT = `${apiGatewayUrl}${WORKFLOW_ENDPOINT}`;

describe('getWorkflowDetails', () => {
    afterEach(jest.clearAllMocks);
    test('fetches successfully data from an API', async () => {
        const response = {
            success: true,
            message: 'Hello World',
            data: { data: ['mock'] },
        };
        mockedRequest.get.mockResolvedValue(response);
        const result = await getWorkflowDetails({ id: '123', apiGatewayUrl });
        expect(mockedRequest.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(response);
    });

    test('getWorkflowDetails() should call wilth proper Request URL', async () => {
        await getWorkflowDetails({ id: '123', apiGatewayUrl: 'google.com' });
        expect(mockedRequest.get).toHaveBeenCalledWith(`${GET_WORKFLOW_ENDPOINT}/123`);
    });

    test('fetches erroneously data from an API', async () => {
        const response = {
            success: false,
            data: { message: 'Hello World', data: ['mock'] },
        };
        mockedRequest.get.mockResolvedValue(response);
        const result = await getWorkflowDetails({ id: '123', apiGatewayUrl: 'google.com' });
        expect(mockedRequest.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
