import Logger from "../../utils/logger";
import {
    IHTTPRequestParams,
    IHTTPResponseError,
} from "../../../interfaces/background/http/i-http-client";
import { IHTTPMiddleware } from "../../../interfaces/background/http/i-http-middleware";
import { BGCoreServices } from "../core-services";
import urlJoin from "../../utils/url-join";
import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";
import { IConfigManager } from "../../../interfaces/background/services/i-config-manager";
import { IService } from "../../../interfaces/background/services/i-service";

export class HTTPResponseError extends Error implements IHTTPResponseError {
    response: Response;
    responseParsed: any;

    constructor(message: string, response: Response) {
        super(message);
        this.response = response;
    }
}

export type HeaderModifier = (headers: Headers) => void;

export class HTTPService implements IService {
    private _middleware: IHTTPMiddleware[] = [];
    private _logger = new Logger("HTTPLayer");
    private _backendHost: string | null = null;
    private _headerModifiers: HeaderModifier[] = [];

    constructor(serviceProvider: IServiceProvider) {
        const configService = serviceProvider.getService(BGCoreServices.CONFIG);
        if (!configService) {
            throw new Error(
                "Can't initialize HTTP service. Dependency missing: ConfigService",
            );
        }
        // @ts-ignore
        const host = (configService as IConfigManager).get("backendHost");
        if (!host) {
            this._logger.warn(
                "Backend host missing from config. If the urls are not absolute, the requests will fail.",
            );
        } else {
            if (!host.startsWith("http://") && !host.startsWith("https://")) {
                throw new Error(
                    "Backend host in config should start with http:// or https://",
                );
            }
        }
        this._backendHost = host;
    }

    addHeaderModifier(modifier: HeaderModifier) {
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

    async get(
        url: string,
        params?: IHTTPRequestParams,
        oneTimeHeaders?: Headers,
    ) {
        let fullUrl = this._buildURL(url, params);
        const reqParams = this._requestInit("GET", null, oneTimeHeaders);
        const request = new Request(fullUrl, reqParams);

        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this._handleResponse(request, response);
    }

    async post(url: string, data: any, oneTimeHeaders?: Headers) {
        let fullUrl = this._buildURL(url);
        const reqParams = this._requestInit("POST", data, oneTimeHeaders);
        const request = new Request(fullUrl, reqParams);

        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this._handleResponse(request, response);
    }

    async put(url: string, data: any, oneTimeHeaders?: Headers) {
        let fullUrl = this._buildURL(url);
        const reqParams = this._requestInit("PUT", data, oneTimeHeaders);
        const request = new Request(fullUrl, reqParams);
        this._middleware.forEach((middleware) =>
            middleware.beforeSend(request),
        );
        const response = await fetch(request);
        return this._handleResponse(request, response);
    }

    _requestInit(
        method: string,
        body: any = null,
        headers: Headers = new Headers(),
    ) {
        let headers_local = new Headers(headers);
        this._headerModifiers.forEach((modifier) => modifier(headers_local));
        return {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: headers_local,
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

        let url_str = urlJoin(host, uri);
        let url = new URL(url_str);
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
