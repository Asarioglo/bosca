export interface IHTTPMiddleware {
    beforeSend: (request: Request) => Promise<void>;
    handleResponse: (
        request: Request,
        response: Response,
        responseData: any,
    ) => Promise<void>;
}
