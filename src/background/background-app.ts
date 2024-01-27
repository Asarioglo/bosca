import { Message } from "../interfaces/common/messaging/message";
import Logger from "./utils/logger";
import { ServiceRegistry } from "../common/services/service-registry";
import { IBrowser } from "../interfaces/common/runtime/i-browser";
import { ConfigService } from "./services/config/config-service";
import { IConfig } from "../interfaces/background/iconfig";
import { HTTPService } from "./services/http/http-service";
import {
    ClientConnectionEvent,
    MessagingEvents,
    MessagingService,
} from "./services/messaging/messaging-service";
import { NotificationService } from "./services/notifications/notification-service";
import WindowService from "./services/windows/window-service";
import { StorageService } from "./services/storage/storage-service";
import { PluginMessagingService } from "./services/messaging/plugin-messaging-service";
import { CoreServices } from "./services/core-services";
import { InstalledPayload } from "../interfaces/background/events/installed-payload";
import { CoreEvents } from "./core-events";
import { AsyncMessageArgs } from "./services/messaging/messaging-manager";
import { PluginRegistry } from "./plugin/plugin-registry";
import { IPluginRegistry } from "../interfaces/background/plugin/i-plugin-registry";

export class BackgroundApp {
    private _logger = new Logger("MainWorker");
    private _browser: IBrowser;
    private _svcRegistry = new ServiceRegistry();
    private _pluginRegistry: IPluginRegistry;

    constructor(browser: IBrowser, config: IConfig) {
        this._browser = browser;
        this._pluginRegistry = new PluginRegistry();

        // Initializing services here so that the user can use them before launching.
        // For example, add configs to config service. If the user wants to override,
        // they can do so before calling start() by registering a service with the same name.
        this._initServices(config);
    }

    async start() {
        this._initListeners();
        await this._pluginRegistry.launch(this._browser, this._svcRegistry);
    }

    getServiceRegistry() {
        return this._svcRegistry;
    }

    getPluginRegistry() {
        return this._pluginRegistry;
    }

    private _initServices(config: IConfig) {
        const configService = new ConfigService(config);
        configService.set("version", this._extractVersion());
        this._svcRegistry.registerService(CoreServices.CONFIG, configService);

        this._svcRegistry.registerService(
            CoreServices.HTTP,
            new HTTPService(this._svcRegistry),
        );
        this._svcRegistry.registerService(
            CoreServices.MESSAGING,
            new MessagingService(this._browser.runtime),
        );
        this._svcRegistry.registerService(
            CoreServices.PLUGIN_MESSAGING,
            new PluginMessagingService(this._svcRegistry),
        );
        this._svcRegistry.registerService(
            CoreServices.NOTIFICATION,
            new NotificationService(this._svcRegistry),
        );
        this._svcRegistry.registerService(
            CoreServices.WINDOW,
            new WindowService(this._browser.windows),
        );
        this._svcRegistry.registerService(
            CoreServices.STORAGE,
            new StorageService(this._browser.storage),
        );
    }

    private _initListeners() {
        this._hearInstalled();
        this._hearOpenCloseEvents();
        // this._hearOneWayMessages();
        // this._hearAsyncMessages();
        // this._internalRelay.addListener(
        //     GlobalEvents.LOGOUT,
        //     this.resetState.bind(this),
        // );
        // this._internalRelay.addListener(
        //     GlobalEvents.RESET_STATE,
        //     this.resetState.bind(this),
        // );
        // this._internalRelay.addListener(
        //     GlobalEvents.NEW_PLUGIN_STATE,
        //     (state: any) => {
        //         this._messagingLayer.broadcastMessage({
        //             type: GlobalMessageType.CONFIG_CHANGED,
        //             payload: state,
        //         });
        //     },
        // );
    }

    // start() {
    //     const state = this._ammendState(this._pluginRegistry.getFullState());
    //     this._messagingLayer.broadcastMessage({
    //         type: GlobalMessageType.CONFIG_CHANGED,
    //         payload: state,
    //     });
    // }

    // async resetState() {
    //     await this._pluginRegistry.resetState();
    //     const state = this._ammendState(this._pluginRegistry.getFullState());
    //     this._messagingLayer.broadcastMessage({
    //         type: GlobalMessageType.CONFIG_CHANGED,
    //         payload: state,
    //     });
    // }

    // getPluginRegistry() {
    //     return this._pluginRegistry;
    // }

    // getInternalRelay() {
    //     return this._internalRelay;
    // }

    // private _hearOneWayMessages() {
    //     this._messagingLayer.addListener(
    //         MessagingLayerEvents.MESSAGE,
    //         async (message: Message) => {
    //             const plugins = this._pluginRegistry.getPlugins();
    //             const context = new Context();
    //             for (const plugin of plugins) {
    //                 await plugin.handlePortMessage(message, context);
    //             }
    //             if (message.type === GlobalMessageType.BROADCAST_STATE) {
    //                 const state = this._ammendState(
    //                     this._pluginRegistry.getFullState(),
    //                 );
    //                 this._messagingLayer.broadcastMessage({
    //                     type: GlobalMessageType.CONFIG_CHANGED,
    //                     payload: state,
    //                 });
    //             }
    //             if (message.type === GlobalMessageType.CLOSE_WINDOW) {
    //                 this._windowService.closeAllWindows();
    //             }
    //             if (message.type === GlobalMessageType.USER_NOTIFICATION) {
    //                 this._notificationService.sendNotificaiton(
    //                     message?.payload?.type,
    //                     message?.payload?.message,
    //                 );
    //             }
    //         },
    //     );
    // }

    // private _hearAsyncMessages() {
    //     this._messagingLayer.addListener(
    //         MessagingLayerEvents.ASYNC_MESSAGE,
    //         async (args: AsyncMessageArgs) => {
    //             const context = new Context();
    //             const plugins = this._pluginRegistry.getPlugins();
    //             for (const plugin of plugins) {
    //                 await plugin.handleAsyncMessage(args.message, context);
    //             }
    //             args.sendResponse(context.getResponseData());
    //         },
    //     );
    // }

    private _hearOpenCloseEvents() {
        const messagingService = this._svcRegistry.getService(
            CoreServices.MESSAGING,
        ) as MessagingService;

        if (!messagingService) {
            throw new Error(
                [
                    "Messaging service not found. If you replaced the default service ",
                    "registry, make sure you register the messaging service.",
                ].join(""),
            );
        }

        messagingService.addListener(
            MessagingEvents.CLIENT_CONNECTED,
            (event: ClientConnectionEvent | Message | AsyncMessageArgs) => {
                this._logger.log(
                    (event as ClientConnectionEvent).client + " connected",
                );
            },
        );
        messagingService.addListener(
            MessagingEvents.CLIENT_DISCONNECTED,
            (event: ClientConnectionEvent | Message | AsyncMessageArgs) => {
                this._logger.log(
                    (event as ClientConnectionEvent).client + " disconnected",
                );
            },
        );
    }

    private _hearInstalled() {
        const pluginMessaging = this._svcRegistry.getService(
            CoreServices.PLUGIN_MESSAGING,
        ) as PluginMessagingService;

        if (!pluginMessaging) {
            throw new Error(
                [
                    "Plugin messaging service not found. If you replaced the default service ",
                    "registry, make sure you register the plugin messaging service.",
                ].join(""),
            );
        }

        this._browser.runtime.onInstalled.addListener((details) => {
            pluginMessaging.emit(
                CoreEvents.INSTALLED,
                details as InstalledPayload,
            );
            const previousVersion = details.previousVersion;
            const reason = details.reason;
        });
    }

    private _extractVersion(): string {
        const manifest = this._browser.runtime.getManifest();
        return manifest.version;
    }

    // private _ammendState(state: any) {
    //     state.version = this._configService.get("version");
    //     state.debugMode = this._configService.get("debugMode");
    //     state.appName = this._configService.get("appName");
    //     state.contactEmail = this._configService.get("contactEmail");
    //     state.website = this._configService.get("website");
    //     state.telegram = this._configService.get("telegram");
    //     return state;
    // }
}
