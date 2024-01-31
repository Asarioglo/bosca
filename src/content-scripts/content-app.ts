import { GlobalMessageTypes } from "../common/messaging/global-message-types";
import { Message } from "../interfaces/common/messaging/message";
import { BackgroundConnection } from "./connection/background-connection";
import { IBrowser } from "../interfaces/common/runtime/i-browser";
import { DefaultNotifier } from "./notifications/default-notifier";
import { IBackgroundConnection } from "../interfaces/content-scripts/connection/i-bg-connection";
import { INotifier } from "../interfaces/content-scripts/notifications/i-notifier";
import { IServiceProvider } from "../interfaces/background/services/i-service-provider";
import { ServiceRegistry } from "../common/services/service-registry";
import { MessagingService } from "./services/messaging/messaging-service";
import { ContentCoreServices } from "./services/core-services";

export class ContentApp {
    private _enableNotifications: boolean;
    private _bgConnector: IBackgroundConnection;
    private _browser: IBrowser;
    private _name: string;
    private _notifier: INotifier;
    private _serviceRegistry: IServiceProvider;

    constructor(browser: IBrowser, appName: string) {
        this._browser = browser;
        this._name = appName;
        this._notifier = new DefaultNotifier(this._name);
        this._bgConnector = new BackgroundConnection(this._browser);
        this._enableNotifications = true;
        this._serviceRegistry = new ServiceRegistry();
    }

    setNotifier(notifier: INotifier): void {
        this._notifier = notifier;
    }

    setBgConnector(bgConnector: IBackgroundConnection): void {
        this._bgConnector = bgConnector;
    }

    async start(): Promise<void> {
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
        this._hearNotifications(messagingSvc);
    }

    private _hearNotifications(messagingSvc: MessagingService): void {
        messagingSvc.addListener(
            GlobalMessageTypes.USER_NOTIFICATION,
            (message: Message) => {
                let payload = message?.payload;
                if (!payload) return;
                if (!payload.message) return;

                let type = payload.type;
                if (!type) type = "info";

                if (this._enableNotifications && this._notifier) {
                    this._notifier.showNotification(type, payload.message);
                }
            },
        );
    }

    public enableNotifications(): void {
        this._enableNotifications = true;
    }

    public disableNotifications(): void {
        this._enableNotifications = false;
    }
}
