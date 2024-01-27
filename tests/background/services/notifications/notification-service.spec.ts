import { CoreServices } from "../../../../src/background/services/core-services";
import { MessagingService } from "../../../../src/background/services/messaging/messaging-service";
import {
    NotificationService,
    NotificationType,
} from "../../../../src/background/services/notifications/notification-service";
import { ServiceRegistry } from "../../../../src/background/services/service-registry";
import { MessageTypes } from "../../../../src/common/messaging/message-types";
import { IServiceProvider } from "../../../../src/interfaces/background/services/i-service-provider";
import { Message } from "../../../../src/interfaces/common/messaging/message";
import { MockMessagingService } from "../../../common/mock-messaging-service";

describe("NotificationService", () => {
    let notificationService: NotificationService;
    let serviceRegistry: IServiceProvider;
    let messagingService: any;

    beforeEach(() => {
        serviceRegistry = new ServiceRegistry();
        messagingService = new MockMessagingService();
        serviceRegistry.registerService(
            CoreServices.MESSAGING,
            messagingService as MessagingService,
        );
        notificationService = new NotificationService(serviceRegistry);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send a success notification", () => {
        const message = "Success message";
        notificationService.success(message);

        expect(messagingService.broadcastMessage).toHaveBeenCalledTimes(1);
        expect(messagingService.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                type: MessageTypes.USER_NOTIFICATION,
                payload: { message, type: NotificationType.SUCCESS },
            } as Message),
        );
    });

    it("should send an error notification", () => {
        const message = "Error message";
        notificationService.error(message);

        expect(messagingService.broadcastMessage).toHaveBeenCalledTimes(1);
        expect(messagingService.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                type: MessageTypes.USER_NOTIFICATION,
                payload: { message, type: NotificationType.ERROR },
            } as Message),
        );
    });

    it("should send a warning notification", () => {
        const message = "Warning message";
        notificationService.warning(message);

        expect(messagingService.broadcastMessage).toHaveBeenCalledTimes(1);
        expect(messagingService.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                type: MessageTypes.USER_NOTIFICATION,
                payload: { message, type: NotificationType.WARNING },
            } as Message),
        );
    });

    it("should send an info notification", () => {
        const message = "Info message";
        notificationService.info(message);

        expect(messagingService.broadcastMessage).toHaveBeenCalledTimes(1);
        expect(messagingService.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                type: MessageTypes.USER_NOTIFICATION,
                payload: { message, type: NotificationType.INFO },
            } as Message),
        );
    });
});