type MessageCallback = ((message: any) => void) | null;
type DisconnectCallback = (() => void) | null;

export type Message = {
    type: string;
    payload?: {
        [key: string]: any;
    };
};

class BackgroundConnection {
    _port: any = null;
    _onMessageCallback: MessageCallback = null;
    _onDisconnectCallback: DisconnectCallback = null;

    static _instance: BackgroundConnection | null = null;
    private constructor() {}

    public static getInstance() {
        if (!this._instance) {
            this._instance = new BackgroundConnection();
        }
        return this._instance;
    }

    connect() {
        this._port = chrome.runtime.connect({ name: "popup" });
        this._port.onMessage.addListener(this._onMessage.bind(this));
        this._port.onDisconnect.addListener(this._onDisconnect.bind(this));
    }

    connected() {
        return this._port !== null;
    }

    _onMessage(message: Message) {
        if (this._onMessageCallback) {
            this._onMessageCallback(message);
        }
    }

    _onDisconnect() {
        if (this._onDisconnectCallback) {
            this._onDisconnectCallback();
        }
        this._port = null;
    }

    sendMessage(message: Message) {
        if (this._port) {
            this._port.postMessage(message);
        }
        return this;
    }

    onMessage(callback: MessageCallback) {
        this._onMessageCallback = callback;
        return this;
    }

    onDisconnect(callback: DisconnectCallback) {
        this._onDisconnectCallback = callback;
        return this;
    }

    disconnect() {
        if (this._port) {
            this._port.disconnect();
        }
        return this;
    }
}

export default BackgroundConnection;
