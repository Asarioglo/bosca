import { BGCoreServices } from "../../core-services";
import { MessagingService } from "../../messaging/messaging-service";
import { NotificationService } from "../notification-service";
import { NotificationType } from "../../../../common/notifications/notification-type";
import { ServiceRegistry } from "../../../../common/services/service-registry";
import { GlobalMessageTypes } from "../../../../common/messaging/global-message-types";
import { IServiceProvider } from "../../../../interfaces/background/services/i-service-provider";
import { Message } from "../../../../interfaces/common/messaging/message";
import { MockMessagingService } from "../../../../../tests/utils/mock-messaging-service";

describe("NotificationService", () => {
    let notificationService: NotificationService;
    let serviceRegistry: IServiceProvider;
    let messagingService: any;

    beforeEach(() => {
        serviceRegistry = new ServiceRegistry();
        messagingService = new MockMessagingService();
        serviceRegistry.registerService(
            BGCoreServices.MESSAGING,
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
                type: GlobalMessageTypes.USER_NOTIFICATION,
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
                type: GlobalMessageTypes.USER_NOTIFICATION,
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
                type: GlobalMessageTypes.USER_NOTIFICATION,
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
                type: GlobalMessageTypes.USER_NOTIFICATION,
                payload: { message, type: NotificationType.INFO },
            } as Message),
        );
    });
});
