import { BackgroundConnection } from "../background-connection";
import { IBrowser } from "../../../interfaces/common/runtime/i-browser";
import getMockRuntime, {
    MockRuntime,
} from "../../../../tests/utils/mock-runtime";

describe("BackgroundConnection", () => {
    let browser: IBrowser;
    let connection: BackgroundConnection;

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

    beforeEach(() => {
        browser = getMockRuntime();
        connection = new BackgroundConnection(browser);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should connect and wait for ack before starting", async () => {
        connection.setConnectionTimeout(100);
        await expect(connection.connect()).rejects.toMatch(
            "Timed out waiting for ack from background script",
        );
    }, 10000);

    it("should connect and start", async () => {
        const port = (browser.runtime as MockRuntime).lastPort;
        // otherwise test will never end
        connection.setKeepAlive(false);
        setTimeout(() => {
            port.onMessage.emit({
                type: "ack",
            });
        }, 250);
        connection.setConnectionTimeout(500);
        await expect(connection.connect()).resolves.toBe(connection);
        expect(port?.onMessage.removeListener).toHaveBeenCalledTimes(1);
        expect(port?.onDisconnect.hasCallbacks).toBeTruthy();
    });

    it("should handle disconnect and reconnect", async () => {
        const port = await getConnectedPort();
        expect(connection.connected()).toBeTruthy();
        const onDisconnect = jest.fn();
        connection.onDisconnect(onDisconnect);

        // By default it will reconnect
        port.onDisconnect.emit();
        expect(connection.connected()).toBeTruthy();
        expect(onDisconnect).toHaveBeenCalledTimes(0);

        // Test the situation when reconnect is disabled
        connection.attemptReconnect(false);
        port.onDisconnect.emit();
        await new Promise(process.nextTick);
        expect(connection.connected()).toBeFalsy();
        expect(onDisconnect).toHaveBeenCalledTimes(1);
    });

    it("should handle failed reconnect graciously", async () => {
        const port = await getConnectedPort();
        expect(connection.connected()).toBeTruthy();
        const onDisconnect = jest.fn();
        connection.onDisconnect(onDisconnect);
        connection.attemptReconnect(true);

        // should trigger attempt to reconnect
        port.onDisconnect.emit();
        // in web browsers the failure to connect is communicated
        // by trigerring the onDisconnect event
        port.onDisconnect.emit();
        // skip a beat to allow the reconnect to happen
        await new Promise(process.nextTick);

        expect(connection.connected()).toBeFalsy();
        expect(onDisconnect).toHaveBeenCalledTimes(1);
    });

    it("should disconnect correctly", async () => {
        const port = await getConnectedPort();
        expect(connection.connected()).toBeTruthy();
        const onDisconnect = jest.fn();
        connection.onDisconnect(onDisconnect);
        port.clearMocks();
        connection.disconnect();
        expect(connection.connected()).toBeFalsy();
        expect(onDisconnect).toHaveBeenCalledTimes(1);
        expect(port.disconnect).toHaveBeenCalledTimes(1);
        expect(port.onMessage.removeListener).toHaveBeenCalledTimes(1);
        expect(port.onDisconnect.removeListener).toHaveBeenCalledTimes(1);
    });

    it("should start and stop keep alive", async () => {
        const port = await getConnectedPort();
        expect(connection.connected()).toBeTruthy();
        port.clearMocks();
        connection.setKeepAliveInterval(100);
        connection.setKeepAlive(true);
        await new Promise((r) => setTimeout(r, 250));
        // should be called more than once
        expect(port.postMessage).toHaveBeenCalledTimes(2);
        expect(port.postMessage).toHaveBeenCalledWith({ type: "keepAlive" });
        connection.setKeepAlive(false);
        port.clearMocks();
        await new Promise((r) => setTimeout(r, 250));
        expect(port.postMessage).toHaveBeenCalledTimes(0);
    });

    it("should send a message", async () => {
        const port = await getConnectedPort();
        expect(connection.connected()).toBeTruthy();
        connection.sendMessage({ type: "test" });
        expect(port.postMessage).toHaveBeenCalledTimes(1);
        expect(port.postMessage).toHaveBeenCalledWith({ type: "test" });
    });

    it("should handle messages", async () => {
        const port = await getConnectedPort();
        expect(connection.connected()).toBeTruthy();
        const onMessage = jest.fn();
        connection.onMessage(onMessage);
        port.onMessage.emit({ type: "test" });
        expect(onMessage).toHaveBeenCalledTimes(1);
        expect(onMessage).toHaveBeenCalledWith({ type: "test" });
        port.onMessage.emit({ type: "test" });
        expect(onMessage).toHaveBeenCalledTimes(2);
    });
});
