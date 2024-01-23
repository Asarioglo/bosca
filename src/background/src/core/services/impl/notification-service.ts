import { GlobalMessageType } from "../../../../../common/messaging/global-messages";
import { IMessagingLayer } from "../../messaging/i-messaging-layer";
import { INotificationService } from "../i-notification-service";

export enum NotificationType {
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
}

export class NotificationService implements INotificationService {
    private _messagingLayer: IMessagingLayer;
    constructor(messagingLayer: IMessagingLayer) {
        this._messagingLayer = messagingLayer;
    }

    sendNotificaiton(type: NotificationType, message: string) {
        if (!type || !message) {
            return;
        }
        this._messagingLayer.broadcastMessage({
            type: GlobalMessageType.USER_NOTIFICATION,
            payload: {
                type,
                message,
            },
        });
    }

    success(message: string): void {
        this.sendNotificaiton(NotificationType.SUCCESS, message);
    }

    error(message: string): void {
        this.sendNotificaiton(NotificationType.ERROR, message);
    }

    warning(message: string): void {
        this.sendNotificaiton(NotificationType.WARNING, message);
    }

    info(message: string): void {
        this.sendNotificaiton(NotificationType.INFO, message);
    }
}
