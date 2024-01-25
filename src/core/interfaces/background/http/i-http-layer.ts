import { HTTPRequestParams } from "./i-http-client";
import { IHTTPMiddleware } from "./i-http-middleware";

export interface IHTTPService {
    addMiddleware: (middleware: IHTTPMiddleware | IHTTPMiddleware[]) => void;
    addHeaderModifier: (modifier: Function) => void;
    setHost(host: string): void;
    get: (url: string, params?: HTTPRequestParams) => Promise<any>;
    post: (url: string, data: any) => Promise<any>;
    put: (url: string, data: any) => Promise<any>;
}
