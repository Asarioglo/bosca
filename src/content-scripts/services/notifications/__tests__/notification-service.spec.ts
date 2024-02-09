import { INotifier } from "../../../../interfaces/content-scripts/notifications/i-notifier";
import { ServiceRegistry } from "../../../../common/services/service-registry";
import { NotificationService } from "../notification-service";
import { NotificationType } from "../../../../common";

class MockNotifier implements INotifier {
    showNotification = jest.fn();
}

describe("NotificationService", () => {
    let svcRegistry = new ServiceRegistry();
    let service: NotificationService;
    let notifier: MockNotifier;

    beforeEach(() => {
        service = new NotificationService("testAppName");
        notifier = new MockNotifier();
        service.setNotifier(notifier);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should show notification", () => {
        service.showNotification(NotificationType.INFO, "test");
        expect(notifier.showNotification).toHaveBeenCalledTimes(1);
        expect(notifier.showNotification).toHaveBeenCalledWith(
            "info",
            "testAppName: test",
        );
    });

    it("should disable app name in message", () => {
        service.includeAppNameInMsg(false);
        service.showNotification(NotificationType.INFO, "test");
        expect(notifier.showNotification).toHaveBeenCalledTimes(1);
        expect(notifier.showNotification).toHaveBeenCalledWith("info", "test");
    });

    it("should enable and disable service", () => {
        service.disable();
        service.showNotification(NotificationType.INFO, "test");
        expect(notifier.showNotification).toHaveBeenCalledTimes(0);
        service.enable();
        service.showNotification(NotificationType.INFO, "test");
        expect(notifier.showNotification).toHaveBeenCalledTimes(1);
    });
});
