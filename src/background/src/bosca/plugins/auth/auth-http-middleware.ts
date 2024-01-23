import { IHTTPMiddleware } from "../../../core/http/i-http-middleware";
import { AuthPlugin } from "./auth-plugin";
import { AuthStateT } from "./auth-state";
import Logger from "../../../core/utils/logger";

export const AuthHTTPMiddleware = (plugin: AuthPlugin) => {
    const _logger = new Logger("AuthHTTPMiddleware");
    return {
        beforeSend: async (request: Request) => {
            _logger.log("Adding auth header");
            const state = plugin.getState() as AuthStateT;
            if (state.authenticated) {
                request.headers.set("Authorization", `Bearer ${state.token}`);
                request.headers.set("Content-Type", "application/json");
            }
        },
        handleResponse: async (
            request: Request,
            response: Response,
            responseData: any,
        ) => {
            _logger.log("Handling response");
            const authString = response?.headers?.get("authorization");
            if (authString) {
                const state = {
                    token: authString.split(" ")[1],
                };
                await plugin.setState(state);
            }
            if (!response.ok) {
                if (response.status === 401) {
                    plugin.logout();
                }
                return;
            }
        },
    } as IHTTPMiddleware;
};
