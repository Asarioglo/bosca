import { MessageTypes } from "../../../common/messaging/message-types";
import { CoreServices } from "../core-services";
import { MessagingService } from "../messaging/messaging-service";
import serviceRegistry from "../service-registry";

export enum NotificationType {
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
}

export class NotificationService {
    constructor() {
        const messagingService = serviceRegistry.getService(
            CoreServices.MESSAGING,
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
        const messaging = serviceRegistry.getService(CoreServices.MESSAGING);
        if (!messaging) {
            throw new Error(
                "Can't send notification. Messaging service not found.",
            );
        }
        (messaging as MessagingService).broadcastMessage({
            type: MessageTypes.USER_NOTIFICATION,
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
