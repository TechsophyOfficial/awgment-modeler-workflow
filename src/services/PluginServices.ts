import { request, ResponseProps } from '../request';
import { FORM_RUNTIME_ENDPOINT, RULE_ENDPOINT } from '../constants/endpoints';
import { FormDetails, SingleForm } from '../components/workflowModeler/plugin/formPicker/FormTypes';

export const FORM_RUNTIME_API_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${FORM_RUNTIME_ENDPOINT}`;
export const RULE_API_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${RULE_ENDPOINT}`;

export const getAllFormsAndComponents = async (): Promise<{
    success: boolean;
    data?: FormDetails[];
}> => {
    const r: ResponseProps = (await request.get(`${FORM_RUNTIME_API_ENDPOINT}?include-content=false`)) as ResponseProps;

    if (r.success) {
        return { success: r.success, data: r.data as FormDetails[] };
    }
    return { success: false };
};

export const getFormOrComponentDetails = async (
    id: string,
): Promise<{ success: boolean; data?: SingleForm; message?: string }> => {
    const r: ResponseProps = (await request.get(`${FORM_RUNTIME_API_ENDPOINT}/${id}`)) as ResponseProps;

    if (r.success) {
        const form = r.data as SingleForm;
        return { success: r.success, data: form, message: r.message };
    }

    return { success: false };
};
