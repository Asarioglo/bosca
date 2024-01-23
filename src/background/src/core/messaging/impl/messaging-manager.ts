import { Message } from "../../../../../common/models/message";
import { IRuntime } from "../../../../../common/runtime/i-runtime";
import { EventEmitter } from "../../event-emitter";

export type AsyncMessageArgs = {
    message: Message;
    sender: any;
    sendResponse: (response: any) => void;
};

export enum MessageManagerEvents {
    MESSAGE = "message",
    EXTERNAL_MESSAGE = "external-message",
}

export class MessageManager extends EventEmitter {
    private _runtime: IRuntime | null = null;

    constructor(runtime: IRuntime) {
        super();
        this._runtime = runtime;
        this._startListening();
    }

    _startListening() {
        this._runtime!.onMessage.addListener(this._onMessage.bind(this));
        this._runtime!.onMessageExternal.addListener(
            this._onExternalMessage.bind(this),
        );
    }

    _onMessage(message: any, sender: any, sendResponse: any) {
        this.emit(MessageManagerEvents.MESSAGE, {
            message: message,
            sender,
            sendResponse: sendResponse,
        } as AsyncMessageArgs);
        return true;
    }

    _onExternalMessage(message: any, sender: any, sendResponse: any) {
        message = this._convertLegacyToNew(message);
        this.emit(MessageManagerEvents.EXTERNAL_MESSAGE, {
            message: message,
            sender,
            sendResponse: sendResponse,
        } as AsyncMessageArgs);
    }
    _convertLegacyToNew(message: any) {
        if (message.action) {
            return {
                type: message.action,
                payload: {
                    ...message,
                },
            } as Message;
        }
    }
}
