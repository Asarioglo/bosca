import { BackgroundConnection } from "../../../src/content-scripts/connection/background-connection";
import { IBrowser } from "../../../src/interfaces/common/runtime/i-browser";
import { IPort } from "../../../src/interfaces/common/runtime/i-port";
import getMockRuntime, {
    MockPort,
    MockRuntime,
} from "../../common/mock-runtime";
import { MessagingService } from "../../../src/content-scripts/services/messaging/messaging-service";

describe("BackgroundConnection", () => {
    let browser: IBrowser;
    let connection: BackgroundConnection;
    let port: MockPort;
    let service: MessagingService;

    const getConnectedPort = async () => {
        const port = (browser.runtime as MockRuntime).lastPort;
        // otherwise test will never end
        connection.setKeepAlive(false);
        setTimeout(() => {
            port.onMessage.emit({
                type: "ack",
            });
        }, 250);
        connection.setConnectionTimeout(500);
        await connection.connect();
        return port;
    };

    beforeEach(async () => {
        browser = getMockRuntime();
        connection = new BackgroundConnection(browser);
        port = await getConnectedPort();
        service = new MessagingService(connection, browser);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send message", () => {
        service.sendMessage("test", "test");
        expect(port.postMessage).toHaveBeenCalledTimes(1);
        expect(port.postMessage).toHaveBeenCalledWith({
            type: "test",
            payload: "test",
        });
    });

    it("should send async message", async () => {
        browser.runtime.sendMessage = jest.fn(
            (message: string, callback: (m: any) => void) => {
                callback("response");
            },
        );
        const response = await service.sendAsyncMessage("test", "test");
        expect(response).toBe("response");
        expect(service.hasPendingMessages()).toBeFalsy();
    });

    it("should handle disconnect", async () => {
        const errHandler = jest.fn((e: Error) => {
            console.log(e);
        });
        service.sendAsyncMessage("test", "test").catch(errHandler);
        port.onDisconnect.emit();
        // wait for the chain of events and promises to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(errHandler).toHaveBeenCalledTimes(1);
    });
});
