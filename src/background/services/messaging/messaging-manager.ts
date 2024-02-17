import { Message } from "../../../interfaces/common/messaging/message";
import { IRuntime } from "../../../interfaces/common/runtime/i-runtime";
import { EventEmitter } from "../../../common/event-emitter";

export type AsyncMessageArgs = {
    async: true;
    message: Message;
    sender: any;
    sendResponse: (response: any) => void;
};

export enum MessageManagerEvents {
    INTERNAL_MESSAGE = "message",
    EXTERNAL_MESSAGE = "external-message",
}

export class MessageManager extends EventEmitter {
    private _runtime: IRuntime | null = null;

    constructor(runtime: IRuntime) {
        super();
        this._runtime = runtime;
        this._startListening();
    }

    _default_listener(message: any, sender: any, sendResponse: any) {
        sendResponse(null);
    }

    _startListening() {
        this._runtime!.onMessage.addListener(this._onMessage.bind(this));
        this._runtime!.onMessageExternal.addListener(
            this._onExternalMessage.bind(this),
        );
    }

    _onMessage(message: any, sender: any, sendResponse: any) {
        this.emit(MessageManagerEvents.INTERNAL_MESSAGE, {
            async: true,
            message: message,
            sender,
            sendResponse: sendResponse,
        } as AsyncMessageArgs);
        return true;
    }

    _onExternalMessage(message: any, sender: any, sendResponse: any) {
        message = this._convertLegacyToNew(message);
        this.emit(MessageManagerEvents.EXTERNAL_MESSAGE, {
            async: true,
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
        return message;
    }
}
