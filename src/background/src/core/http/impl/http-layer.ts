import Logger from "../../utils/logger";
import { HTTPRequestParams, IHTTPClient } from "../i-http-client";
import { IHTTPLayer } from "../i-http-layer";
import { IHTTPMiddleware } from "../i-http-middleware";
import { HTTPResponseError } from "./http-client";

export class HTTPLayer implements IHTTPLayer {
    private _middleware: IHTTPMiddleware[] = [];
    private _httpClient: IHTTPClient;
    private _logger = new Logger("HTTPLayer");

    constructor(httpClient: IHTTPClient) {
        this._httpClient = httpClient;
    }

    buildURL(uri: string, params?: HTTPRequestParams) {
        return this._httpClient.buildURL(uri, params);
    }

    addMiddleware(middleware: IHTTPMiddleware | IHTTPMiddleware[]) {
        if (Array.isArray(middleware)) {
            this._middleware.push(...middleware);
            return;
        }
        this._middleware.push(middleware);
    }

    async handleResponse(request: Request, response: Response) {
        const responseData = await response.json();
        this._middleware.forEach((middleware) =>
            middleware.handleResponse(request, response, responseData),
        );
        if (!response.ok) {
            const error = new HTTPResponseError(response.statusText, response);
            error.responseParsed = responseData;
            this._logger.log(response.statusText);
            throw error;
        }

        return responseData;
    }

    async get(url: string, params?: HTTPRequestParams) {
        const request = this._httpClient.buildGetRequest(url, params);
        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this.handleResponse(request, response);
    }

    async post(url: string, data: any) {
        const request = this._httpClient.buildPostRequest(url, data);
        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this.handleResponse(request, response);
    }

    async put(url: string, data: any) {
        const request = this._httpClient.buildPutRequest(url, data);
        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this.handleResponse(request, response);
    }
}
