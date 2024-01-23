import { IRuntime } from "../../../../common/runtime/i-runtime";
import { IStorage } from "../../../../common/runtime/i-storage";
import { AbstractPlugin } from "./abstract-plugin";
import { EventEmitter } from "../event-emitter";
import { IHTTPLayer } from "../http/i-http-layer";
import { IWindowService } from "../services/i-window-service";
import { AppConfig, IConfigService } from "../services/i-config-service";
import Logger from "../utils/logger";
import { INotificationService } from "../services/i-notification-service";

export class PluginRegistry {
    private _plugins: AbstractPlugin<any>[] = [];
    private _http_layer: IHTTPLayer;
    private _runtime: IRuntime;
    private _storage: IStorage;
    private _windowService: IWindowService;
    private _internalRelay: EventEmitter;
    private _configService: IConfigService<AppConfig>;
    private _notificationService: INotificationService;

    private _logger = new Logger("PluginRegistry");

    constructor(
        runtime: IRuntime,
        storage: IStorage,
        windows: IWindowService,
        http_layer: IHTTPLayer,
        internalRelay: EventEmitter,
        configService: IConfigService<AppConfig>,
        notificationService: INotificationService,
    ) {
        this._http_layer = http_layer;
        this._runtime = runtime;
        this._storage = storage;
        this._windowService = windows;
        this._internalRelay = internalRelay;
        this._configService = configService;
        this._notificationService = notificationService;
    }

    async registerPlugin(plugin: AbstractPlugin<any>) {
        this._logger.log("Registering plugin " + plugin.getName());
        const middlewares = plugin.getHTTPMiddlewares();
        if (middlewares.length > 0) {
            this._logger.log(
                "Adding HTTP middlewares for plugin " + plugin.getName(),
            );
            this._http_layer.addMiddleware(middlewares);
        }
        const connected = await plugin.connect(
            this._runtime,
            this._storage,
            this._http_layer,
            this._windowService,
            this._internalRelay,
            this._configService,
            this._notificationService,
        );
        if (!connected) {
            throw new Error("Could not connect plugin");
        }
        this._plugins.push(plugin);
    }

    getFullState() {
        return this._plugins.reduce((acc, plugin) => {
            return { ...acc, [plugin.getName()]: plugin.getState() };
        }, {});
    }

    getPlugins() {
        return this._plugins;
    }

    async resetState() {
        for (const plugin of this._plugins) {
            await plugin.resetState();
        }
    }
}
