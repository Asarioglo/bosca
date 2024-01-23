import { Message } from "../../common/models/message";
import { ChromeRuntime } from "../../common/runtime/chrome/chrome-runtime";
import { ChromeSyncStorage } from "../../common/runtime/chrome/chrome-sync-storage";
import { ChromeWindows } from "../../common/runtime/chrome/chrome-windows";
import { HTTPClient } from "./core/http/impl/http-client";
import { HTTPLayer } from "./core/http/impl/http-layer";
import { IHTTPLayer } from "./core/http/i-http-layer";
import { IMessagingLayer } from "./core/messaging/i-messaging-layer";
import {
    ClientConnectionEvent,
    MessagingLayer,
    MessagingLayerEvents,
} from "./core/messaging/impl/messaging-layer";
import { AsyncMessageArgs } from "./core/messaging/impl/messaging-manager";
import { PluginRegistry } from "./core/plugin/plugin-registry";
import WindowService from "./core/services/impl/window-service";
import { Context } from "./core/plugin/context";
import { InternalRelay } from "./core/internal-relay";
import Logger from "./core/utils/logger";
import { GlobalEvents } from "./core/global-events";
import { ConfigService } from "./core/services/impl/config-service";
import { GlobalMessageType } from "../../common/messaging/global-messages";
import { AppConfig } from "./core/services/i-config-service";
import { NotificationService } from "./core/services/impl/notification-service";

export class MainWorker<T extends AppConfig> {
    private _pluginRegistry: PluginRegistry;
    private _httpLayer: IHTTPLayer;
    private _messagingLayer: IMessagingLayer;
    private _internalRelay: InternalRelay;
    private _runtime = ChromeRuntime;
    private _configService: ConfigService<T>;
    private _windowService: WindowService;
    private _notificationService: NotificationService;

    private _logger = new Logger("MainWorker");

    constructor(config: T) {
        this._configService = new ConfigService<T>();
        this._configService.set(config);

        this._runtime = ChromeRuntime;
        const storage = new ChromeSyncStorage();
        this._windowService = new WindowService(ChromeWindows);

        const httpClient = new HTTPClient(this._configService.get("baseURL"));
        this._httpLayer = new HTTPLayer(httpClient);
        this._messagingLayer = new MessagingLayer(this._runtime);
        this._internalRelay = new InternalRelay();
        this._notificationService = new NotificationService(
            this._messagingLayer,
        );

        this._pluginRegistry = new PluginRegistry(
            this._runtime,
            storage,
            this._windowService,
            this._httpLayer,
            this._internalRelay,
            this._configService,
            this._notificationService,
        );
        this.initialize();

        this._logger.disable();
    }

    initialize() {
        this._hearInstalled();
        this._hearOneWayMessages();
        this._hearAsyncMessages();
        this._hearOpenCloseEvents();
        this._extractVersion();
        this._internalRelay.addListener(
            GlobalEvents.LOGOUT,
            this.resetState.bind(this),
        );
        this._internalRelay.addListener(
            GlobalEvents.RESET_STATE,
            this.resetState.bind(this),
        );
        this._internalRelay.addListener(
            GlobalEvents.NEW_PLUGIN_STATE,
            (state: any) => {
                this._messagingLayer.broadcastMessage({
                    type: GlobalMessageType.CONFIG_CHANGED,
                    payload: state,
                });
            },
        );
    }

    start() {
        const state = this._ammendState(this._pluginRegistry.getFullState());
        this._messagingLayer.broadcastMessage({
            type: GlobalMessageType.CONFIG_CHANGED,
            payload: state,
        });
    }

    async resetState() {
        await this._pluginRegistry.resetState();
        const state = this._ammendState(this._pluginRegistry.getFullState());
        this._messagingLayer.broadcastMessage({
            type: GlobalMessageType.CONFIG_CHANGED,
            payload: state,
        });
    }

    getPluginRegistry() {
        return this._pluginRegistry;
    }

    getInternalRelay() {
        return this._internalRelay;
    }

    private _hearOneWayMessages() {
        this._messagingLayer.addListener(
            MessagingLayerEvents.MESSAGE,
            async (message: Message) => {
                const plugins = this._pluginRegistry.getPlugins();
                const context = new Context();
                for (const plugin of plugins) {
                    await plugin.handlePortMessage(message, context);
                }
                if (message.type === GlobalMessageType.BROADCAST_STATE) {
                    const state = this._ammendState(
                        this._pluginRegistry.getFullState(),
                    );
                    this._messagingLayer.broadcastMessage({
                        type: GlobalMessageType.CONFIG_CHANGED,
                        payload: state,
                    });
                }
                if (message.type === GlobalMessageType.CLOSE_WINDOW) {
                    this._windowService.closeAllWindows();
                }
                if (message.type === GlobalMessageType.USER_NOTIFICATION) {
                    this._notificationService.sendNotificaiton(
                        message?.payload?.type,
                        message?.payload?.message,
                    );
                }
            },
        );
    }

    private _hearAsyncMessages() {
        this._messagingLayer.addListener(
            MessagingLayerEvents.ASYNC_MESSAGE,
            async (args: AsyncMessageArgs) => {
                const context = new Context();
                const plugins = this._pluginRegistry.getPlugins();
                for (const plugin of plugins) {
                    await plugin.handleAsyncMessage(args.message, context);
                }
                args.sendResponse(context.getResponseData());
            },
        );
    }

    private _hearOpenCloseEvents() {
        this._messagingLayer.addListener(
            MessagingLayerEvents.CLIENT_CONNECTED,
            (event: ClientConnectionEvent) => {
                this._logger.log(event.client + " connected");
            },
        );
        this._messagingLayer.addListener(
            MessagingLayerEvents.CLIENT_DISCONNECTED,
            (event: ClientConnectionEvent) => {
                this._logger.log(event.client + " disconnected");
            },
        );
    }

    private _hearInstalled() {
        this._runtime.onInstalled.addListener((details) => {
            this._internalRelay.emit(GlobalEvents.INSTALLED, details);
            const previousVersion = details.previousVersion;
            const reason = details.reason;

            this._logger.log(`Previous Version: ${previousVersion}`);

            switch (reason) {
                case "install":
                    this._internalRelay.emit(
                        GlobalEvents.LOG_METRIC,
                        "Extension installed",
                    );
                    break;
                case "update":
                    this._internalRelay.emit(
                        GlobalEvents.LOG_METRIC,
                        `updated from version: ${previousVersion} to ${this._configService.get(
                            "version",
                        )}}`,
                    );
                    break;
                case "chrome_update":
                case "shared_module_update":
                default:
                    this._internalRelay.emit(
                        GlobalEvents.LOG_METRIC,
                        "other install events in browser happened.",
                    );
                    break;
            }
        });
    }

    private _extractVersion() {
        const manifest = this._runtime.getManifest();
        this._configService.set("version", manifest.version);
    }

    private _ammendState(state: any) {
        state.version = this._configService.get("version");
        state.debugMode = this._configService.get("debugMode");
        state.appName = this._configService.get("appName");
        state.contactEmail = this._configService.get("contactEmail");
        state.website = this._configService.get("website");
        state.telegram = this._configService.get("telegram");
        return state;
    }
}
