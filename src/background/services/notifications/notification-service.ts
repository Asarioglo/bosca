import { GlobalMessageTypes } from "../../../common/messaging/global-message-types";
import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";
import { BGCoreServices } from "../core-services";
import { MessagingService } from "../messaging/messaging-service";
import { NotificationType } from "../../../common/notifications/notification-type";

export class NotificationService {
    private _svcRegistry: IServiceProvider;
    constructor(serviceRegistry: IServiceProvider) {
        this._svcRegistry = serviceRegistry;
        const messagingService = serviceRegistry.getService(
            BGCoreServices.MESSAGING,
        );
        if (!messagingService) {
            throw new Error(
                "Can't initialize Notification service. Dependency missing: MessagingService",
            );
        }
    }

    sendNotificaiton(type: NotificationType, message: string) {
        if (!type || !message) {
            return;
        }
        // Could cache this, but it's not worth it at the moment. Maybe a plugin
        // will replace the service.
        const messaging = this._svcRegistry.getService(BGCoreServices.MESSAGING);
        if (!messaging) {
            throw new Error(
                "Can't send notification. Messaging service not found.",
            );
        }
        (messaging as MessagingService).broadcastMessage({
            type: GlobalMessageTypes.USER_NOTIFICATION,
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
