import Logger from "../../utils/logger";
import {
    HTTPRequestParams,
    IHTTPResponseError,
} from "../../../interfaces/background/http/i-http-client";
import { IHTTPMiddleware } from "../../../interfaces/background/http/i-http-middleware";
import urlJoin from "url-join";
import serviceRegistry from "../service-registry";
import { ConfigService } from "../config/config-service";
import { CoreServices } from "../core-services";

export class HTTPResponseError extends Error implements IHTTPResponseError {
    response: Response;
    responseParsed: any;

    constructor(message: string, response: Response) {
        super(message);
        this.response = response;
    }
}

export class HTTPService {
    private _middleware: IHTTPMiddleware[] = [];
    private _logger = new Logger("HTTPLayer");
    private _backendHost: string | null = null;
    private _headerModifiers: Function[] = [];

    constructor() {
        const configService = serviceRegistry.getService(CoreServices.CONFIG);
        if (!configService) {
            throw new Error(
                "Can't initialize HTTP service. Dependency missing: ConfigService",
            );
        }
        const host = (configService as ConfigService).get("backendHost");
        if (!host) {
            this._logger.warn(
                "Backend host missing from config. If the urls are not absolute, the requests will fail.",
            );
        }
    }

    addHeaderModifier(modifier: Function) {
        this._headerModifiers.push(modifier);
    }

    addMiddleware(middleware: IHTTPMiddleware | IHTTPMiddleware[]) {
        if (Array.isArray(middleware)) {
            this._middleware.push(...middleware);
            return;
        }
        this._middleware.push(middleware);
    }

    setHost(host: string): void {
        this._backendHost = host;
    }

    async get(url: string, params?: HTTPRequestParams) {
        let fullUrl = this._buildURL(url, params);
        const reqParams = this._requestInit("GET");
        const request = new Request(fullUrl, reqParams);

        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this._handleResponse(request, response);
    }

    async post(url: string, data: any) {
        let fullUrl = this._buildURL(url);
        const reqParams = this._requestInit("POST", data);
        const request = new Request(fullUrl, reqParams);

        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this._handleResponse(request, response);
    }

    async put(url: string, data: any) {
        let fullUrl = this._buildURL(url);
        const reqParams = this._requestInit("PUT", data);
        const request = new Request(fullUrl, reqParams);
        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this._handleResponse(request, response);
    }

    _requestInit(method: string, body: any = null) {
        return {
            method,
            body: body ? JSON.stringify(body) : undefined,
        };
    }

    _buildURL(
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

    async _handleResponse(request: Request, response: Response) {
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
}
