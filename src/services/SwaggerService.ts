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

// export const SWAGGER_API_ENDPOINT = `${process.env.REACT_APP_SWAGGER_URL}${SWAGGER_ENDPOINT}`;

const getSwaggerSpec = async (url: string, swaggerUrl): Promise<OpenAPIObject | null> => {
    const res: OpenAPIObject = (await request.get(`${swaggerUrl}${url}`)) as OpenAPIObject;
    if (res) {
        return res;
    }
    return null;
};

export const getSwaggerSpecsList = async (swaggerUrl): Promise<OpenAPIObject[]> => {
    const swaggerSpecList: OpenAPIObject[] = [];
    const SWAGGER_API_ENDPOINT = `${swaggerUrl}${SWAGGER_ENDPOINT}`;
    const res: SwaggerResponse = (await request.get(SWAGGER_API_ENDPOINT)) as SwaggerResponse;
    if (res?.urls) {
        for (const { url } of res.urls) {
            const swaggerRes = await getSwaggerSpec(url, swaggerUrl);
            swaggerRes && swaggerSpecList.push(swaggerRes);
        }
    }

    return swaggerSpecList;
};
