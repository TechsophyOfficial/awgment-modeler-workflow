import { request } from '../request';
import { SWAGGER_ENDPOINT } from 'constants/endpoints';
import { OpenAPIObject } from 'openapi3-ts';

interface URLS {
    url: string;
    name: string;
}

interface SwaggerResponse {
    urls: URLS[];
}

export const SWAGGER_API_ENDPOINT = `${process.env.REACT_APP_SWAGGER_URL}${SWAGGER_ENDPOINT}`;

const getSwaggerSpec = async (url: string): Promise<OpenAPIObject | null> => {
    const res: OpenAPIObject = (await request.get(`${process.env.REACT_APP_SWAGGER_URL}${url}`)) as OpenAPIObject;
    if (res) {
        return res;
    }
    return null;
};

export const getSwaggerSpecsList = async (): Promise<OpenAPIObject[]> => {
    const swaggerSpecList: OpenAPIObject[] = [];
    const res: SwaggerResponse = (await request.get(SWAGGER_API_ENDPOINT)) as SwaggerResponse;
    if (res?.urls) {
        for (const { url } of res.urls) {
            const swaggerRes = await getSwaggerSpec(url);
            swaggerRes && swaggerSpecList.push(swaggerRes);
        }
    }

    return swaggerSpecList;
};
