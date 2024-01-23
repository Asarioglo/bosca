import Logger from "../../utils/logger";
import {
    HTTPRequestParams,
    IHTTPResponseError,
    IHTTPClient,
} from "../i-http-client";
import urlJoin from "url-join";

export class HTTPResponseError extends Error implements IHTTPResponseError {
    response: Response;
    responseParsed: any;

    constructor(message: string, response: Response) {
        super(message);
        this.response = response;
    }
}

export class HTTPClient implements IHTTPClient {
    private _backendHost: string | null = null;
    private _headerModifiers: Function[] = [];
    private _logger = new Logger("HTTPService");

    constructor(backendHost: string) {
        this._backendHost = backendHost;
    }

    buildURL(
        uri: string,
        params: Record<string, string | number> | null = null,
    ) {
        let host = this._backendHost;
        if (uri.startsWith("http://") || uri.startsWith("https://")) {
            host = "";
        }
        if (host === null) {
            throw new Error("HTTPService not initialized");
        }

        let url = new URL(urlJoin(host, uri));
        if (params) {
            Object.keys(params).forEach((key) =>
                url.searchParams.append(key, params[key].toString()),
            );
        }
        return url;
    }

    addHeaderModifier(modifier: Function) {
        this._headerModifiers.push(modifier);
    }

    async handleResponse(response: Response) {
        if (!response.ok) {
            const error = new HTTPResponseError(response.statusText, response);
            const parsed = await response.json();
            error.responseParsed = parsed;
            this._logger.log(response.statusText);
            throw error;
        }

        const respObject = await response.json();
        return respObject;
    }

    _requestInit(method: string, body: any = null) {
        return {
            method,
            body: body ? JSON.stringify(body) : undefined,
        };
    }

    buildGetRequest(url: string, params?: HTTPRequestParams): Request {
        let fullUrl = this.buildURL(url, params);
        const reqParams = this._requestInit("GET");
        const request = new Request(fullUrl, reqParams);

        return request;
    }

    buildPostRequest(uri: string, body: any) {
        let fullUrl = this.buildURL(uri);

        const reqParams = this._requestInit("POST", body);
        const request = new Request(fullUrl, reqParams);

        return request;
    }

    buildPutRequest(uri: string, body: any) {
        let fullUrl = this.buildURL(uri);
        const reqParams = this._requestInit("PUT", body);
        return new Request(fullUrl, reqParams);
    }
}
