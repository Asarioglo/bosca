import { EventEmitter } from "../../../common/event-emitter";
import { Message } from "../../../interfaces/common/messaging/message";
import { IBrowser } from "../../../interfaces/common/runtime/i-browser";
import { IBackgroundConnection } from "../../../interfaces/content-scripts/connection/i-bg-connection";

export class MessagingService extends EventEmitter {
    private _connection: IBackgroundConnection;
    private _browser: IBrowser;

    constructor(bgConnection: IBackgroundConnection, browser: IBrowser) {
        super();
        this._connection = bgConnection;
        this._connection.onMessage(this._onMessage.bind(this));
        this._browser = browser;
    }

    private _onMessage(message: Message): void {
        this.emit(message.type, message);
    }

    sendMessage(type: string, payload: any): void {
        this._connection.sendMessage({ type, payload });
    }

    async sendAsyncMessage(type: string, payload: any): Promise<any> {
        return new Promise((resolve, reject) => {
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
    }
}
