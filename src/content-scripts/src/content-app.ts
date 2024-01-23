import { GlobalMessageType } from "../../common/messaging/global-messages";
import { Message } from "../../common/models/message";
import { IRuntime } from "../../common/runtime/i-runtime";
import { BackgroundConnection } from "./connection/background-connection";
import { Connection } from "./connection/connection";
import { Notifier } from "./notifier";

export class ContentApp {
    private _enableNotifications: boolean;
    private _bgConnector: Connection;
    private _runtime: IRuntime;
    private _messageListeners: {
        [key: string]: ((message: Message) => void)[];
    };
    private _nodeInsertedListeners: ((node: HTMLElement) => void)[];
    private _name: string;
    private _notifier: Notifier;

    constructor(runtime: IRuntime, appName: string) {
        this._runtime = runtime;
        this._name = appName;
        this._notifier = new Notifier(this._name);
        this._bgConnector = new BackgroundConnection(this._runtime);
        this._enableNotifications = true;
        this._messageListeners = {};
        this._nodeInsertedListeners = [];
        this._initialize();
    }

    private _initialize(): void {
        this._bgConnector.onMessage(this.onMessage.bind(this));
        this._bgConnector.connect();

        this.addMessageListener(
            GlobalMessageType.USER_NOTIFICATION,
            (message) => {
                let type = message?.payload?.type;
                if (!type) type = "info";
                if (!message?.payload?.message) return;

                this._onNotification(
                    message.payload.type,
                    message.payload.message,
                );
            },
        );
        this._initializeMutationObserver();

        this._bgConnector.sendMessage({
            type: GlobalMessageType.BROADCAST_STATE,
        });
    }

    private _initializeMutationObserver(): void {
        const observer = new MutationObserver(this._onMutation.bind(this));
        observer.observe(document, {
            childList: true,
            subtree: true,
        });
    }

    private _onNotification(type: string, message: string): void {
        if (this._enableNotifications && this._notifier) {
            this._notifier.showNotification(type, message);
        }
    }

    private _onMutation(mutations: MutationRecord[]): void {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    for (let listener of this._nodeInsertedListeners) {
                        listener(node as HTMLElement);
                    }
                }
            }
        });
    }

    public enableNotificationsFunc(): void {
        this._enableNotifications = true;
    }

    public disableNotifications(): void {
        this._enableNotifications = false;
    }

    public addMessageListener(
        messageType: string,
        listener: (message: Message) => void,
    ): void {
        if (!this._messageListeners[messageType]) {
            this._messageListeners[messageType] = [];
        }
        this._messageListeners[messageType].push(listener);
    }

    public addNodeInsertedListener(
        listener: (node: HTMLElement) => void,
    ): void {
        this._nodeInsertedListeners.push(listener);
    }

    public onMessage(message: Message): void {
        if (this._messageListeners[message.type]) {
            for (let listener of this._messageListeners[message.type]) {
                listener(message);
            }
        }
    }

    public sendMessage(message: Message): void {
        this._bgConnector!.sendMessage(message);
    }
}
