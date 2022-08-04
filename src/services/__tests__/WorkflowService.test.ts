import { GET_WORKFLOW_ENDPOINT, getWorkflowDetails } from '../WorkflowService';
import { request } from '../../request';

jest.mock('../../request');

const mockedRequest = request as jest.Mocked<typeof request>;

describe('getWorkflowDetails', () => {
    afterEach(jest.clearAllMocks);
    test('fetches successfully data from an API', async () => {
        const response = {
            success: true,
            message: 'Hello World',
            data: { data: ['mock'] },
        };
        mockedRequest.get.mockResolvedValue(response);
        const result = await getWorkflowDetails('123');
        expect(mockedRequest.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(response);
    });

    test('getWorkflowDetails() should call wilth proper Request URL', async () => {
        await getWorkflowDetails('123');
        expect(mockedRequest.get).toHaveBeenCalledWith(`${GET_WORKFLOW_ENDPOINT}/123`);
    });

    test('fetches erroneously data from an API', async () => {
        const response = {
            success: false,
            data: { message: 'Hello World', data: ['mock'] },
        };
        mockedRequest.get.mockResolvedValue(response);
        const result = await getWorkflowDetails('123');
        expect(mockedRequest.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
