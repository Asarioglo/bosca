import { HTTPRequestParams } from "./i-http-client";
import { IHTTPMiddleware } from "./i-http-middleware";

export interface IHTTPLayer {
    buildURL: (uri: string, params?: HTTPRequestParams) => URL;
    addMiddleware: (middleware: IHTTPMiddleware | IHTTPMiddleware[]) => void;
    get: (url: string, params?: HTTPRequestParams) => Promise<any>;
    post: (url: string, data: any) => Promise<any>;
    put: (url: string, data: any) => Promise<any>;
}
