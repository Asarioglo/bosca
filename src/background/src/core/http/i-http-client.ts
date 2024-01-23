export type HTTPRequestParams = Record<string, string | number>;

export interface IHTTPResponseError extends Error {
    response: Response;
    responseParsed: any;
}

export interface IHTTPClient {
    buildURL(uri: string, params?: HTTPRequestParams): URL;
    buildGetRequest(url: string, params?: HTTPRequestParams): Request;
    buildPostRequest(url: string, data: any): Request;
    buildPutRequest(url: string, data: any): Request;
    handleResponse(response: Response): Promise<any>;
}
