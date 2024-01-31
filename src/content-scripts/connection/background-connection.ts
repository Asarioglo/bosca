import { Message } from "../../interfaces/common/messaging/message";
import { IRuntime } from "../../interfaces/common/runtime/i-runtime";
import { IPort } from "../../interfaces/common/runtime/i-port";
import { IBrowser } from "../../interfaces/common/runtime/i-browser";
import { IBackgroundConnection } from "../../interfaces/content-scripts/connection/i-bg-connection";

export class BackgroundConnection implements IBackgroundConnection {
    private _runtime: IRuntime;
    private _port: IPort | null;
    private _onMessageCallback: ((message: Message) => void) | null;
    private _onDisconnectCallback: (() => void) | null;
    private _attemptReconnect: boolean = true;
    private _keepAlive: boolean = true;
    private _keepAliveInterval = 20e3;
    private _keepAliveTimer: any = null;
    private _connectTimeout: number = 5e3;
    private _isConnected: boolean = false;

    private _onMsgInternal_: (message: Message) => void;
    private _onDisconnectInternal_: () => void;

    constructor(browser: IBrowser) {
        this._runtime = browser.runtime;
        this._port = null;
        this._onMessageCallback = null;
        this._onDisconnectCallback = null;
        this._onMsgInternal_ = this._onMessage.bind(this);
        this._onDisconnectInternal_ = this._onDisconnect.bind(this);
    }

    async connect(): Promise<BackgroundConnection> {
        this._clearPort();
        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
                reject("Timed out waiting for ack from background script");
                this._port?.onMessage.removeListener(ackCallback);
                this._port?.onDisconnect.removeListener(
                    handleInstantDisconnect,
                );
            }, this._connectTimeout);
            const ackCallback = (message: Message) => {
                // We may lose some messages here, but that's ok
                // Later we could store and replay them
                if (message.type === "ack") {
                    clearTimeout(timeout);
                    this._port?.onMessage.removeListener(ackCallback);
                    this._port?.onDisconnect.removeListener(
                        handleInstantDisconnect,
                    );
                    this._port?.onMessage.addListener(this._onMsgInternal_);
                    this._port?.onDisconnect.addListener(
                        this._onDisconnectInternal_,
                    );
                    this._startKeepAlive();
                    this._isConnected = true;
                    resolve(this);
                }
            };
            let handleInstantDisconnect = () => {
                clearTimeout(timeout);
                this._port?.onMessage.removeListener(ackCallback);
                this._port?.onDisconnect.removeListener(
                    handleInstantDisconnect,
                );
                reject("Disconnected before ack received");
            };
            this._port = this._runtime.connect({ name: "content-script" });
            this._port.onDisconnect.addListener(handleInstantDisconnect);
            this._port.onMessage.addListener(ackCallback);
        });
    }

    disconnect() {
        if (this._port) {
            this._port.onMessage.removeListener(this._onMsgInternal_);
            this._port.onDisconnect.removeListener(this._onDisconnectInternal_);
            this._port.disconnect();
            this._port = null;
        }
        this._isConnected = false;
        this._stopKeepAlive();
        if (this._onDisconnectCallback) {
            this._onDisconnectCallback();
        }
    }

    private _clearPort() {
        if (this._port) {
            this._port.onMessage.removeListener(this._onMsgInternal_);
            this._port.onDisconnect.removeListener(this._onDisconnectInternal_);
            this._port = null;
        }
    }

    connected(): boolean {
        return this._isConnected;
    }

    attemptReconnect(attemptReconnect: boolean): BackgroundConnection {
        this._attemptReconnect = attemptReconnect;
        return this;
    }

    /**
     * The time that the connection will wait for when
     * called connect() before raising an error.
     * @param timeout The timeout in milliseconds.
     * @returns
     */
    setConnectionTimeout(timeout: number): BackgroundConnection {
        this._connectTimeout = timeout;
        return this;
    }

    private _startKeepAlive(): BackgroundConnection {
        if (this._keepAlive && !this._keepAliveTimer) {
            this._keepAliveTimer = setInterval(() => {
                this.sendMessage({ type: "keepAlive" });
            }, this._keepAliveInterval);
        }
        return this;
    }

    private _stopKeepAlive(): BackgroundConnection {
        if (this._keepAliveTimer) {
            clearInterval(this._keepAliveTimer);
            this._keepAliveTimer = null;
        }
        return this;
    }

    private _onMessage(message: Message): void {
        console.log("BG_CONNECT: message received: " + message.type);
        if (this._onMessageCallback) {
            this._onMessageCallback(message);
        }
    }

    private _onDisconnect(): void {
        console.log("BG_CONNECT: disconnected");
        this._clearPort();
        this._stopKeepAlive();
        if (this._attemptReconnect) {
            this.connect().catch((e) => {
                this._isConnected = false;
                if (this._onDisconnectCallback) {
                    this._onDisconnectCallback();
                }
            });
            return;
        }
        this._isConnected = false;
        if (this._onDisconnectCallback) {
            this._onDisconnectCallback();
        }
    }

    setKeepAlive(keepAlive: boolean): BackgroundConnection {
        this._keepAlive = keepAlive;
        if (!keepAlive && this._keepAliveTimer) {
            return this._stopKeepAlive();
        }
        return this._startKeepAlive();
    }

    setKeepAliveInterval(interval: number): BackgroundConnection {
        this._keepAliveInterval = interval;
        if (this._keepAliveTimer) {
            this._stopKeepAlive();
            this._startKeepAlive();
        }
        return this;
    }

    sendMessage(message: Message): void {
        if (this._port) {
            this._port.postMessage(message);
        }
    }

    onMessage(callback: (message: Message) => void): void {
        this._onMessageCallback = callback;
    }

    // Assuming you might also want to set _onDisconnectCallback
    onDisconnect(callback: () => void): void {
        this._onDisconnectCallback = callback;
    }
}
