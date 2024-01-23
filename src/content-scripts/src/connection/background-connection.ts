import { Message } from "../../../common/models/message";
import { IRuntime, Port } from "../../../common/runtime/i-runtime";
import { Connection } from "./connection";

export class BackgroundConnection implements Connection {
    private _runtime: IRuntime;
    private _port: Port | null;
    private _onMessageCallback: ((message: Message) => void) | null;
    private _onDisconnectCallback: (() => void) | null;
    private _attemptReconnect: boolean;
    private _interval: number | null;

    constructor(runtime: IRuntime) {
        this._runtime = runtime;
        this._port = null;
        this._onMessageCallback = null;
        this._onDisconnectCallback = null;
        this._attemptReconnect = true;
        this._interval = null;
    }

    connect(): void {
        this._port = this._runtime.connect({ name: "content-script" });
        this._port.onMessage.addListener(this._onMessage.bind(this));
        this._port.onDisconnect.addListener(this._onDisconnect.bind(this));
        this._interval = window.setInterval(() => {
            this.sendMessage({ type: "keepAlive" });
        }, 20e3);
    }

    private _onMessage(message: Message): void {
        console.log("BG_CONNECT: message received: " + message.type);
        if (this._onMessageCallback) {
            this._onMessageCallback(message);
        }
    }

    private _onDisconnect(): void {
        console.log("BG_CONNECT: disconnected");
        if (this._onDisconnectCallback) {
            this._onDisconnectCallback();
        }
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
