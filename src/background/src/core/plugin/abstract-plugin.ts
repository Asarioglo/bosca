import { Message } from "../../../../common/models/message";
import { IStorage } from "../../../../common/runtime/i-storage";
import { IRuntime } from "../../../../common/runtime/i-runtime";
import { IHTTPLayer } from "../http/i-http-layer";
import { IWindowService } from "../services/i-window-service";
import { AbstractState } from "./abstract-state";
import { Context } from "./context";
import { IHTTPMiddleware } from "../http/i-http-middleware";
import { EventEmitter } from "../event-emitter";
import { AppConfig, IConfigService } from "../services/i-config-service";
import { GlobalEvents } from "../global-events";
import { INotificationService } from "../services/i-notification-service";

export type AbstractPluginParams = [
    // Knows how to communicate with the browser
    runtime: IRuntime,
    // Knows how to store and retrieve data
    storage: IStorage,
    // Knows how to make HTTP requests
    httpLayer: IHTTPLayer,
    // Knows how to open, close windows
    windowService: IWindowService,
    // Internal application messages such as state changes.
    internalRelay: EventEmitter,
    // Knows how to retrieve configuration
    configService: IConfigService<AppConfig>,
    // Knows how to send notifications
    notificationService: INotificationService,
];

export abstract class AbstractPlugin<T extends AbstractState<any>> {
    protected _name: string = "";
    protected _state!: T;
    protected _runtime!: IRuntime;
    protected _storage!: IStorage;
    protected _httpLayer!: IHTTPLayer;
    protected _windowService!: IWindowService;
    protected _internalRelay!: EventEmitter;
    protected _configService!: IConfigService<AppConfig>;
    protected _notificationService!: INotificationService;

    constructor(name: string) {
        this._name = name;
    }

    getName(): string {
        return this._name;
    }

    async connect(...args: AbstractPluginParams) {
        this._runtime = args[0];
        this._storage = args[1];
        this._httpLayer = args[2];
        this._windowService = args[3];
        this._internalRelay = args[4];
        this._configService = args[5];
        this._notificationService = args[6];
        return this;
    }

    // Port messages don't expect any response. These are synchronous,
    // One-way messages.
    abstract handlePortMessage(
        message: Message,
        context: Context,
    ): Promise<void>;

    // Async messages are messages that expect a response. These are
    // asynchronous, two-way messages.
    abstract handleAsyncMessage(
        message: Message,
        context: Context,
    ): Promise<any>;

    abstract handleExternalMessage(
        message: Message,
        context: Context,
    ): Promise<void>;

    getState() {
        if (this._state) {
            return this._state.getState();
        }
        return null;
    }

    getStateObject(): AbstractState<any> | null {
        return this._state || null;
    }

    setState(state: any) {
        if (this._state) {
            return this._state.setState(state);
        }
        return null;
    }

    getHTTPMiddlewares(): IHTTPMiddleware[] {
        return [];
    }

    async resetState() {
        if (this._state) {
            await this._state.resetState();
        }
    }

    broadcastStateChange() {
        this._internalRelay.emit(GlobalEvents.NEW_PLUGIN_STATE, {
            [this.getName()]: this.getState(),
        });
    }
}
