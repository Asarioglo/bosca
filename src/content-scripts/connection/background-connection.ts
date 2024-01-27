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
    private _attemptReconnect: boolean;
    private _keepAlive: boolean = true;
    private _keepAliveInterval = 20e3;
    private _interval: number | null;

    constructor(browser: IBrowser) {
        this._runtime = browser.runtime;
        this._port = null;
        this._onMessageCallback = null;
        this._onDisconnectCallback = null;
        this._attemptReconnect = true;
        this._interval = null;
    }

    async connect(): Promise<BackgroundConnection> {
        return new Promise((resolve, reject) => {
            let ackCallback = (message: Message) => {
                if (message.type === "ack") {
                    this._port?.onMessage.removeListener(ackCallback);
                    this._port?.onMessage.addListener(
                        this._onMessage.bind(this),
                    );
                    this._port?.onDisconnect.addListener(
                        this._onDisconnect.bind(this),
                    );
                    this._startKeepAlive();
                    resolve(this);
                }
            };
            this._port = this._runtime.connect({ name: "content-script" });
        });
    }

    private _startKeepAlive(): BackgroundConnection {
        if (this._keepAlive && !this._interval) {
            this._interval = window.setInterval(() => {
                this.sendMessage({ type: "keepAlive" });
            }, this._keepAliveInterval);
        }
        return this;
    }

    private _stopKeepAlive(): BackgroundConnection {
        if (this._interval) {
            window.clearInterval(this._interval);
            this._interval = null;
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
        this._port = null;
        if (this._interval !== null) {
            window.clearInterval(this._interval);
        }
        this._interval = null;
        if (this._attemptReconnect) {
            window.setTimeout(() => {
                this.connect();
            }, 500);
        }
        if (this._onDisconnectCallback) {
            this._onDisconnectCallback();
        }
    }

    setKeepAlive(keepAlive: boolean): BackgroundConnection {
        this._keepAlive = keepAlive;
        if (!keepAlive && this._interval) {
            return this._stopKeepAlive();
        }
        return this._startKeepAlive();
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
