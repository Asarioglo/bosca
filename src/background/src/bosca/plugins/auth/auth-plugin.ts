import { Message } from "../../../../../common/models/message";
import {
    AbstractPlugin,
    AbstractPluginParams,
} from "../../../core/plugin/abstract-plugin";
import { AuthState } from "./auth-state";
import Logger from "../../../core/utils/logger";
import { GlobalEvents } from "../../../core/global-events";
import { IHTTPMiddleware } from "../../../core/http/i-http-middleware";
import { AuthHTTPMiddleware } from "./auth-http-middleware";
import { AuthFunctions } from "./auth-functions";
import { GlobalMessageType } from "../../../../../common/messaging/global-messages";
import { Context } from "../../../core/plugin/context";

export class AuthPlugin extends AbstractPlugin<AuthState> {
    private _logger = new Logger("AuthPlugin");
    constructor() {
        super("auth");
        this._logger.disable();
    }

    async connect(...args: AbstractPluginParams) {
        this._logger.log("Connecting plugin");
        super.connect(...args);
        this._logger.log("Setting up state");

        if (!this._storage) {
            throw new Error("Storage not set, this should never happen");
        }
        this._state = new AuthState(this._storage);
        await this._state.load();
        this._logger.log("Auth plugin connected");
        return this;
    }

    async handlePortMessage(message: Message, context: Context) {
        switch (message.type) {
            case GlobalMessageType.LOGIN_MAIN_USER:
                this._logger.log("Login flow requested");
                AuthFunctions.openAuthFlow(
                    this._windowService,
                    this._configService,
                );
                break;
            case "loginSuccess":
                if (!message.payload?.user || !message.payload?.user?.token) {
                    throw new Error(
                        "Login success message received without token",
                    );
                }
                this._state?.setState({
                    authenticated: true,
                    token: message.payload.user.token,
                });
                this.broadcastStateChange();
                break;
            case GlobalMessageType.LOG_OUT:
                // This will trigger a reset state on all plugins
                this._internalRelay.emit(GlobalEvents.LOGOUT);
                break;
        }
        context.addStateData(this.getName(), this._state.getState());
    }

    async handleAsyncMessage(message: Message, context: any) {
        this._logger.log("Async message received");
    }

    async handleExternalMessage(message: Message, context: any) {}

    getHTTPMiddlewares(): IHTTPMiddleware[] {
        this._logger.log("Getting HTTP middlewares");
        return [AuthHTTPMiddleware(this)];
    }

    getStateObject() {
        if (!this._state) {
            throw new Error("State not set, this should never happen");
        }
        return this._state;
    }

    logout() {
        if (this._internalRelay) {
            this._internalRelay.emit(GlobalEvents.LOGOUT);
        }
    }
}
