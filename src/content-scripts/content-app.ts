import { GlobalMessageTypes } from "../common/messaging/global-message-types";
import { Message } from "../interfaces/common/messaging/message";
import { BackgroundConnection } from "./connection/background-connection";
import { IBrowser } from "../interfaces/common/runtime/i-browser";
import { IBackgroundConnection } from "../interfaces/content-scripts/connection/i-bg-connection";
import { IServiceProvider } from "../interfaces/background/services/i-service-provider";
import { ServiceRegistry } from "../common/services/service-registry";
import { MessagingService } from "./services/messaging/messaging-service";
import { ContentCoreServices } from "./services/core-services";
import { NotificationService } from "./services/notifications/notification-service";
import { NotificationType } from "../common";
import { ConfigChangeMessage, ConfigChangePayload } from "../background";
import { NodeLifecycleService } from "./services/content-ops/node-lifecycle-service";

export class ContentApp {
    private _bgConnector: IBackgroundConnection;
    private _browser: IBrowser;
    private _name: string;
    private _serviceRegistry: IServiceProvider;

    constructor(browser: IBrowser, appName: string) {
        this._browser = browser;
        this._name = appName;
        this._bgConnector = new BackgroundConnection(this._browser);
        this._serviceRegistry = new ServiceRegistry();
    }

    setBgConnector(bgConnector: IBackgroundConnection): void {
        this._bgConnector = bgConnector;
    }

    async start(): Promise<void> {
        // TODO: Separate service initialization from start method
        // this will allow the user to override services before starting the app.
        if (!this._bgConnector) {
            throw new Error("Background connector not set");
        }
        await this._bgConnector.connect();
        const messagingSvc = new MessagingService(
            this._bgConnector,
            this._browser,
        );
        this._serviceRegistry.registerService(
            ContentCoreServices.MESSAGING,
            messagingSvc,
        );

        const notificationSvc = new NotificationService(
            this._serviceRegistry,
            this._name,
        );
        this._serviceRegistry.registerService(
            ContentCoreServices.NOTIFICATION,
            notificationSvc,
        );

        const nodeLifcycleSvc = new NodeLifecycleService();
        this._serviceRegistry.registerService(
            ContentCoreServices.NODE_LIFECYCLE,
            nodeLifcycleSvc,
        );

        this._hearNotifications(messagingSvc, notificationSvc);
        this._hearConfigChange(messagingSvc);
    }

    protected _handleConfigChange(message: ConfigChangeMessage): void {
        let payload = message?.payload as ConfigChangePayload;
        if (!payload) return;

        if ("notifications.enabled" in payload) {
            payload["notifications.enabled"].newValue === true
                ? this.enableNotifications()
                : this.disableNotifications();
        }
    }

    private _hearConfigChange(messagingService: MessagingService) {
        messagingService.addListener(
            GlobalMessageTypes.CONFIG_CHANGED,
            (message: Message) => {
                this._handleConfigChange(message as ConfigChangeMessage);
            },
        );
    }

    private _hearNotifications(
        messagingSvc: MessagingService,
        notificationSvc: NotificationService,
    ): void {
        messagingSvc.addListener(
            GlobalMessageTypes.USER_NOTIFICATION,
            (message: Message) => {
                let payload = message?.payload;
                if (!payload) return;
                if (!payload.message) return;

                let type = payload.type as NotificationType;
                if (!type) type = NotificationType.INFO;

                notificationSvc.showNotification(
                    type,
                    payload.message as string,
                );
            },
        );
    }

    public enableNotifications(): void {
        let notSvc = this._serviceRegistry.getService<NotificationService>(
            ContentCoreServices.NOTIFICATION,
        );
        notSvc?.enable();
    }

    public disableNotifications(): void {
        let notSvc = this._serviceRegistry.getService<NotificationService>(
            ContentCoreServices.NOTIFICATION,
        );
        notSvc?.disable();
    }
}
