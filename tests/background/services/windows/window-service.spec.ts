import { WindowService } from "../../../../src/background/services/windows/window-service";
import {
    IWindow,
    IWindows,
} from "../../../../src/interfaces/common/runtime/i-windows";
import {
    GenericEmitter,
    MockWindow,
    MockWindows,
} from "../../../common/mock-runtime";

describe("WindowService", () => {
    let windowService: WindowService;
    let mockWindows: IWindows;
    let mockWindow: IWindow;

    beforeEach(() => {
        mockWindows = new MockWindows();
        windowService = new WindowService(mockWindows);
    });

    afterEach(() => {
        // Clean up any open windows
        jest.clearAllMocks();
    });

    describe("openWindow", () => {
        it("should open a new window with the specified URL, width, height, and type", async () => {
            const url = "https://example.com";
            const width = 800;
            const height = 600;
            const type = "popup";
            const closedCallback = jest.fn();

            const window = await windowService.openWindow(
                url,
                width,
                height,
                type,
                closedCallback,
            );

            // Verify that the create method was called with the correct parameters
            expect(mockWindows.create).toHaveBeenCalledWith({
                url,
                width,
                height,
                type,
            });
        });

        it("should call the closedCallback when the window is closed", async () => {
            const url = "https://example.com";
            const width = 800;
            const height = 600;
            const type = "popup";
            const closedCallback = jest.fn();

            // Open a window
            const w1: IWindow = await windowService.openWindow(
                url,
                width,
                height,
                type,
                closedCallback,
            );

            // Verify that the create method was called with the correct parameters
            expect(w1.type).toBe(type);

            // verify windows present
            const windows = windowService.getOpenWindows();
            expect(windows.length).toBe(1);

            const onRemoved = mockWindows.onRemoved as GenericEmitter<number>;

            // window closed outside of service (e.g. user closed it)
            onRemoved.emit(w1.id);
            expect(closedCallback).toHaveBeenCalledTimes(1);
            expect(windowService.getOpenWindows().length).toBe(0);

            // verify that the service unsubscribed from the onRemoved event
            expect(onRemoved.removeListener).toHaveBeenCalledTimes(1);
        });
    });

    describe("closeAllWindows", () => {
        it("should close all open windows", async () => {
            const url1 = "https://example.com";
            const url2 = "https://example.com";
            const width = 800;
            const height = 600;
            const type1 = "popup";
            const type2 = "popup";
            const closedCallback = jest.fn();

            // Open a window
            const w1: IWindow = await windowService.openWindow(
                url1,
                width,
                height,
                type1,
                closedCallback,
            );

            // Verify that the create method was called with the correct parameters
            expect(w1.type).toBe(type1);

            // verify windows present
            const windows = windowService.getOpenWindows();
            expect(windows.length).toBe(1);

            // close all windows
            windowService.closeAllWindows();
            expect(mockWindows.remove).toHaveBeenCalledTimes(1);
            expect(windowService.getOpenWindows().length).toBe(0);
        });
    });
});
