import { Message } from "../interfaces/common/messaging/message";
import { ChromeRuntime } from "../common/runtime/chrome/chrome-runtime";
import { ChromeSyncStorage } from "../common/runtime/chrome/chrome-sync-storage";
import { ChromeWindows } from "../common/runtime/chrome/chrome-windows";
import Logger from "./utils/logger";
import { IRuntime } from "../interfaces/common/runtime/i-runtime";
import serviceRegistry from "./services/service-registry";
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

export class MainWorker {
    private _logger = new Logger("MainWorker");
    private _browser: IBrowser;

    constructor(browser: IBrowser, config: IConfig) {
        this._browser = browser;

        const configService = new ConfigService(config);
        configService.set("version", this._extractVersion());
        serviceRegistry.registerService(CoreServices.CONFIG, configService);
        serviceRegistry.registerService(CoreServices.HTTP, new HTTPService());
        serviceRegistry.registerService(
            CoreServices.MESSAGING,
            new MessagingService(browser.runtime),
        );
        serviceRegistry.registerService(
            CoreServices.PLUGIN_MESSAGING,
            new PluginMessagingService(),
        );
        serviceRegistry.registerService(
            CoreServices.NOTIFICATION,
            new NotificationService(),
        );
        serviceRegistry.registerService(
            CoreServices.WINDOW,
            new WindowService(browser.windows),
        );
        serviceRegistry.registerService(
            CoreServices.STORAGE,
            new StorageService(browser.storage),
        );

        // this._pluginRegistry = new PluginRegistry(
        //     this._runtime,
        //     storage,
        //     this._windowService,
        //     this._httpLayer,
        //     this._internalRelay,
        //     this._configService,
        //     this._notificationService,
        // );
        this._initListeners();

        // this._logger.disable();
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
        const messagingService = serviceRegistry.getService(
            CoreServices.MESSAGING,
        ) as MessagingService;
        messagingService.addListener(
            MessagingEvents.CLIENT_CONNECTED,
            (event: ClientConnectionEvent) => {
                this._logger.log(event.client + " connected");
            },
        );
        messagingService.addListener(
            MessagingEvents.CLIENT_DISCONNECTED,
            (event: ClientConnectionEvent) => {
                this._logger.log(event.client + " disconnected");
            },
        );
    }

    private _hearInstalled() {
        const pluginMessaging = serviceRegistry.getService(
            CoreServices.PLUGIN_MESSAGING,
        ) as PluginMessagingService;

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
