import { Message } from "../interfaces/common/messaging/message";
import Logger from "./utils/logger";
import { ServiceRegistry } from "../common/services/service-registry";
import { IBrowser } from "../interfaces/common/runtime/i-browser";
import { ConfigService } from "./services/config/config-service";
import { ConfigEntry, IConfig } from "../interfaces/common/iconfig";
import { HTTPService } from "./services/http/http-service";
import {
    ClientConnectionEvent,
    MessagingEvents,
    MessagingService,
} from "./services/messaging/messaging-service";
import { NotificationService } from "./services/notifications/notification-service";
import { WindowService } from "./services/windows/window-service";
import { StorageService } from "./services/storage/storage-service";
import { PluginMessagingService } from "./services/messaging/plugin-messaging-service";
import { BGCoreServices } from "./services/core-services";
import {
    CoreEvents,
    InstalledPayload,
    InstalledMessage,
    UserNotificationMessage,
} from "./core-events";
import { AsyncMessageArgs } from "./services/messaging/messaging-manager";
import { PluginRegistry } from "./plugin/plugin-registry";
import { IPluginRegistry } from "../interfaces/background/plugin/i-plugin-registry";
import { Actions, AsyncActions, SetConfigPayload } from "./actions";
import { IConfigManager } from "../interfaces";

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
        const configService = new ConfigService(this._svcRegistry, config);
        configService.set("version", this._extractVersion());
        this._svcRegistry.registerService(BGCoreServices.CONFIG, configService);

        this._svcRegistry.registerService(
            BGCoreServices.HTTP,
            new HTTPService(this._svcRegistry),
        );
        this._svcRegistry.registerService(
            BGCoreServices.MESSAGING,
            new MessagingService(this._browser.runtime),
        );
        this._svcRegistry.registerService(
            BGCoreServices.PLUGIN_MESSAGING,
            new PluginMessagingService(this._svcRegistry),
        );
        this._svcRegistry.registerService(
            BGCoreServices.NOTIFICATION,
            new NotificationService(this._svcRegistry),
        );
        this._svcRegistry.registerService(
            BGCoreServices.WINDOW,
            new WindowService(this._browser.windows),
        );
        this._svcRegistry.registerService(
            BGCoreServices.STORAGE,
            new StorageService(this._browser.storage),
        );
    }

    private _initListeners() {
        const messagingService = this._svcRegistry.getService(
            BGCoreServices.MESSAGING,
        ) as MessagingService;

        if (!messagingService) {
            throw new Error(
                [
                    "Messaging service not found. If you replaced the default service ",
                    "registry, make sure you register the messaging service.",
                ].join(""),
            );
        }

        const pluginMessaging = this._svcRegistry.getService(
            BGCoreServices.PLUGIN_MESSAGING,
        ) as PluginMessagingService;

        if (!pluginMessaging) {
            throw new Error(
                [
                    "Plugin messaging service not found. If you replaced the default service ",
                    "registry, make sure you register the plugin messaging service.",
                ].join(""),
            );
        }

        const notificationService = this._svcRegistry.getService(
            BGCoreServices.NOTIFICATION,
        ) as NotificationService;

        if (!notificationService) {
            throw new Error(
                [
                    "Notification service not found. If you replaced the default service ",
                    "registry, make sure you register the notification service.",
                ].join(""),
            );
        }

        const configService = this._svcRegistry.getService<ConfigService>(
            BGCoreServices.CONFIG,
        ) as ConfigService;

        if (!configService) {
            throw new Error(
                [
                    "Config service not found. If you replaced the default service ",
                    "registry, make sure you register the config service.",
                ].join(""),
            );
        }

        this._hearInstalled(messagingService, pluginMessaging);
        this._hearOpenCloseEvents(messagingService);
        this._hearStateRequests(messagingService);
        this._hearNotificationRequests(messagingService, notificationService);
        this._hearConfigChangeRequests(messagingService, configService);
    }

    private _hearNotificationRequests(
        messagingService: MessagingService,
        notificationService: NotificationService,
    ) {
        messagingService.addListener(
            CoreEvents.USER_NOTIFICATION,
            (message: Message | AsyncMessageArgs | ClientConnectionEvent) => {
                message = message as UserNotificationMessage;
                const type = message.payload?.type;
                const msg = message.payload?.message;
                if (!type || !msg) return;
                notificationService.sendNotificaiton(type, msg);
            },
        );
    }

    private _hearOpenCloseEvents(messagingService: MessagingService) {
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

    private _hearInstalled(
        messagingService: MessagingService,
        pluginMessaging: PluginMessagingService,
    ) {
        this._browser.runtime.onInstalled.addListener(
            (details: InstalledPayload) => {
                pluginMessaging.emit(
                    CoreEvents.INSTALLED,
                    details as InstalledPayload,
                );
                messagingService.broadcastMessage({
                    type: CoreEvents.INSTALLED,
                    payload: details,
                } as InstalledMessage);
            },
        );
    }

    private _hearStateRequests(messagingService: MessagingService) {
        messagingService.addListener(
            AsyncActions.GET_STATE,
            (message: AsyncMessageArgs | Message | ClientConnectionEvent) => {
                if ((message as AsyncMessageArgs).async) {
                    const state = this._pluginRegistry.getFullState();
                    this._ammendState(state);
                    (message as AsyncMessageArgs).sendResponse(state);
                    return;
                }
            },
        );
    }

    private _hearConfigChangeRequests(
        messagingService: MessagingService,
        configService: ConfigService,
    ) {
        messagingService.addListener(
            Actions.SET_CONFIG,
            (message: Message | AsyncMessageArgs | ClientConnectionEvent) => {
                const payload = (message as Message)
                    .payload as SetConfigPayload;
                if (!payload) return;

                if (payload.key && payload.value) {
                    configService.set(payload.key, payload.value);
                }
                if (payload.config) {
                    configService.set(payload.config);
                }
            },
        );
    }

    private _extractVersion(): string {
        const manifest = this._browser.runtime.getManifest();
        return manifest.version;
    }

    private _ammendState(state: any) {
        const configSvc = this._svcRegistry.getService(
            BGCoreServices.CONFIG,
        ) as IConfigManager;
        const config = configSvc.getFullConfig();
        for (const key in config) {
            state[key] = config[key];
        }

        return state;
    }
}
