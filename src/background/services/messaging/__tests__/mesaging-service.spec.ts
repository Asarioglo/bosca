import { IBrowser } from "../../../../interfaces/common/runtime/i-browser";
import { MessagingEvents, MessagingService } from "../messaging-service";
import getMockRuntime, {
    GenericEmitter,
    IMockBrowser,
    MockPort,
} from "../../../../../tests/utils/mock-runtime";
import { Message } from "../../../../interfaces/common/messaging/message";

describe("MessagingService", () => {
    let browser: IMockBrowser;
    let service: MessagingService;

    beforeEach(async () => {
        browser = getMockRuntime();
        service = new MessagingService(browser);
        await service.start(browser, {} as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should detect that a content script is connected", () => {
        const listener = jest.fn();
        service.addListener(MessagingEvents.CLIENT_CONNECTED, listener);
        const contentPort = new MockPort("content-script");
        (browser.runtime.onConnect as GenericEmitter).emit(contentPort);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                client: "content",
            }),
        );
        expect(contentPort.postMessage).toHaveBeenCalledTimes(1);
        expect(contentPort.postMessage).toHaveBeenCalledWith({
            type: "ack",
        });
    });

    it("should detect that a content script is disconnected", () => {
        const listener = jest.fn();
        service.addListener(MessagingEvents.CLIENT_DISCONNECTED, listener);
        const port = new MockPort("content-script");
        (browser.runtime.onConnect as GenericEmitter).emit(port);
        expect(listener).toHaveBeenCalledTimes(0);
        port.onDisconnect.emit();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                client: "content",
            }),
        );
    });

    it("should detect that a popup is connected", () => {
        const listener = jest.fn();
        service.addListener(MessagingEvents.CLIENT_CONNECTED, listener);
        const port = new MockPort("popup");
        (browser.runtime.onConnect as GenericEmitter).emit(port);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                client: "popup",
            }),
        );
        expect(port.postMessage).toHaveBeenCalledTimes(1);
        expect(port.postMessage).toHaveBeenCalledWith({
            type: "ack",
        });
    });

    it("should detect that a popup is disconnected", () => {
        const listener = jest.fn();
        service.addListener(MessagingEvents.CLIENT_DISCONNECTED, listener);
        const port = new MockPort("popup");
        (browser.runtime.onConnect as GenericEmitter).emit(port);
        expect(listener).toHaveBeenCalledTimes(0);
        port.onDisconnect.emit();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                client: "popup",
            }),
        );
    });

    it("should detect internal messages", () => {
        const listener = jest.fn();
        service.addListener(MessagingEvents.ASYNC_MESSAGE, listener);
        let sendResponse = jest.fn();
        (browser.runtime.onMessage as GenericEmitter<any, any, Function>).emit(
            { type: "test" } as Message,
            "sender",
            sendResponse,
        );
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                async: true,
                message: {
                    type: "test",
                },
                sender: "sender",
                sendResponse,
            }),
        );
    });

    it("should detect external messages", () => {
        const listener = jest.fn();
        service.addListener(MessagingEvents.ASYNC_MESSAGE, listener);
        let sendResponse = jest.fn();
        (
            browser.runtime.onMessageExternal as GenericEmitter<
                any,
                any,
                Function
            >
        ).emit({ type: "test" } as Message, "sender", sendResponse);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                async: true,
                message: {
                    type: "test",
                },
                sender: "sender",
                sendResponse,
            }),
        );
    });

    it("should detect port messages", () => {
        const listener = jest.fn();
        service.addListener(MessagingEvents.MESSAGE, listener);
        const contentPort = new MockPort("content-script");
        (browser.runtime.onConnect as GenericEmitter).emit(contentPort);
        const popupPort = new MockPort("popup");
        (browser.runtime.onConnect as GenericEmitter).emit(popupPort);
        contentPort.onMessage.emit({ type: "test" } as Message);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "test",
            }),
        );
        listener.mockClear();
        popupPort.onMessage.emit({ type: "test" } as Message);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "test",
            }),
        );
    });

    it("should broadcast messages to all ports", () => {
        const contentPort = new MockPort("content-script");
        (browser.runtime.onConnect as GenericEmitter).emit(contentPort);
        const popupPort = new MockPort("popup");
        (browser.runtime.onConnect as GenericEmitter).emit(popupPort);
        popupPort.postMessage.mockClear(); // Clear ack message
        contentPort.postMessage.mockClear(); // Clear ack message
        service.broadcastMessage({ type: "test" } as Message);
        expect(contentPort.postMessage).toHaveBeenCalledTimes(1);
        expect(contentPort.postMessage).toHaveBeenCalledWith({
            type: "test",
        });
        expect(popupPort.postMessage).toHaveBeenCalledTimes(1);
        expect(popupPort.postMessage).toHaveBeenCalledWith({
            type: "test",
        });
    });

    it("should send content and popup messages separately", () => {
        const contentPort = new MockPort("content-script");
        (browser.runtime.onConnect as GenericEmitter).emit(contentPort);
        const popupPort = new MockPort("popup");
        (browser.runtime.onConnect as GenericEmitter).emit(popupPort);

        // Clear ack messages
        popupPort.postMessage.mockClear();
        contentPort.postMessage.mockClear();

        // test content message
        service.sendContentMessage({ type: "test" } as Message);
        expect(contentPort.postMessage).toHaveBeenCalledTimes(1);
        expect(contentPort.postMessage).toHaveBeenCalledWith({
            type: "test",
        });
        expect(popupPort.postMessage).toHaveBeenCalledTimes(0);

        // test popup message
        service.sendPopupMessage({ type: "test" } as Message);
        expect(contentPort.postMessage).toHaveBeenCalledTimes(1);
        expect(popupPort.postMessage).toHaveBeenCalledTimes(1);
        expect(popupPort.postMessage).toHaveBeenCalledWith({
            type: "test",
        });
    });
});
