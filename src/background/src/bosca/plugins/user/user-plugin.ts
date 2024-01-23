import { Message } from "../../../../../common/models/message";
import {
    AbstractPlugin,
    AbstractPluginParams,
} from "../../../core/plugin/abstract-plugin";
import Logger from "../../../core/utils/logger";
import { GlobalEvents } from "../../../core/global-events";
import { IHTTPMiddleware } from "../../../core/http/i-http-middleware";
import { GlobalMessageType } from "../../../../../common/messaging/global-messages";
import { UserState } from "./user-state";
import { UserFunctions } from "./user-functions";
import { Context } from "../../../core/plugin/context";

export class UserPlugin extends AbstractPlugin<UserState> {
    private _logger = new Logger("UserPlugin");
    constructor() {
        super("user");
        this._logger.disable();
    }

    async connect(...args: AbstractPluginParams) {
        this._logger.log("Connecting plugin");
        super.connect(...args);
        this._logger.log("Setting up state");

        if (!this._storage) {
            throw new Error("Storage not set, this should never happen");
        }
        this._state = new UserState(this._storage);
        await this._state.load();
        this._logger.log("User plugin connected");
        return this;
    }

    async handlePortMessage(message: Message, context: Context) {
        switch (message.type) {
            case "loginSuccess":
                const user = await UserFunctions.getFullUserObject(
                    this._httpLayer,
                );
                if (!user) {
                    // The middlewares should have handled this. The state will be reset.
                    return;
                }
                this._state?.setState(user);
                this.broadcastStateChange();
                break;
        }
        context.addStateData(this.getName(), this.getState());
    }

    async handleAsyncMessage(message: Message, context: any) {
        switch (message.type) {
            case GlobalMessageType.SAVE_USER_SETTINGS:
                const newUser = await UserFunctions.saveUserSettings(
                    this._httpLayer,
                    message.payload,
                );
                if (!newUser) {
                    context.addResponseData(this.getName(), {
                        settingsSaved: false,
                    });
                } else {
                    await this._state.setState(newUser);
                    context.addResponseData(this.getName(), {
                        settingsSaved: true,
                    });
                    this.broadcastStateChange();
                }
        }
    }

    async handleExternalMessage(message: Message, context: any) {}

    getHTTPMiddlewares(): IHTTPMiddleware[] {
        return [];
    }

    getStateObject() {
        if (!this._state) {
            throw new Error("State not set, this should never happen");
        }
        return this._state;
    }
}
