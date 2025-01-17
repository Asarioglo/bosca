import { EventEmitter } from "../../../common/event-emitter";
import { Message } from "../../../interfaces/common/messaging/message";
import { IBrowser } from "../../../interfaces/common/runtime/i-browser";
import { IBackgroundConnection } from "../../../interfaces/content-scripts/connection/i-bg-connection";

export class MessagingService extends EventEmitter {
    private _connection: IBackgroundConnection;
    private _browser: IBrowser;
    private _promises: {
        promise: Promise<any>;
        reject: (reason: any) => void;
    }[] = [];

    constructor(bgConnection: IBackgroundConnection, browser: IBrowser) {
        super();
        this._connection = bgConnection;
        this._connection.onMessage(this._onMessage.bind(this));
        this._connection.onDisconnect(this._handleDisconnect.bind(this));
        this._browser = browser;
    }

    private _onMessage(message: Message): void {
        this.emit(message.type, message);
    }

    private _handleDisconnect(): void {
        const disconnectError = new Error(
            "Disconnected from background script",
        );
        this._promises.forEach((p) => p.reject(disconnectError));
        this._promises = [];
    }

    sendMessage(type: string, payload: any): void {
        this._connection.sendMessage({ type, payload });
    }

    hasPendingMessages(): boolean {
        return this._promises.length > 0;
    }

    async sendAsyncMessage(type: string, payload: any): Promise<any> {
        let rejectFn: () => void;
        const promise = new Promise((resolve, reject) => {
            rejectFn = reject;
            this._browser.runtime.sendMessage(
                { type, payload },
                (response: any) => {
                    if (this._browser.runtime.lastError) {
                        reject(this._browser.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                },
            );
        });

        this._promises.push({ promise, reject: rejectFn! });

        promise
            .then(() => this._removePromise(promise))
            .catch(() => this._removePromise(promise));

        return promise;
    }

    _removePromise(promise: Promise<any>): void {
        this._promises = this._promises.filter((p) => p.promise !== promise);
    }
}
