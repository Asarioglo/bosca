import { Message } from "../../../interfaces/common/messaging/message";
import { IRuntime } from "../../../interfaces/common/runtime/i-runtime";
import { EventEmitter } from "../../event-emitter";
import Logger from "../../utils/logger";
import {
    AsyncMessageArgs,
    MessageManager,
    MessageManagerEvents,
} from "./messaging-manager";
import { PortManager, PortManagerEvents } from "./port-manager";

export enum MessagingEvents {
    ASYNC_MESSAGE = "async-message",
    MESSAGE = "message",
    CLIENT_CONNECTED = "client-connected",
    CLIENT_DISCONNECTED = "client-disconnected",
}

export type ClientConnectionEvent = {
    client: "popup" | "content";
};

export class MessagingService extends EventEmitter {
    private messaging: MessageManager;
    private portMessaging: PortManager;
    private _logger: Logger = new Logger("MessagingLayer");

    // TODO: constructor should receive ServiceProvider
    constructor(runtime: IRuntime) {
        super();
        this.messaging = new MessageManager(runtime);
        this.portMessaging = new PortManager(runtime);
        this._connect();
    }

    public override addListener(
        eventType: string,
        listener: (
            message: Message | AsyncMessageArgs | ClientConnectionEvent,
        ) => void,
    ): MessagingService {
        super.addListener(eventType, listener);
        return this;
    }

    private _emitTypedMessage(
        message: Message | AsyncMessageArgs | ClientConnectionEvent,
    ) {
        let type;
        if ((message as AsyncMessageArgs).async) {
            type = (message as AsyncMessageArgs).message.type;
        } else {
            type = (message as Message).type;
        }
        this.emit(type, message);
    }

    private _connect() {
        this.messaging.addListener(
            MessageManagerEvents.INTERNAL_MESSAGE,
            (event: AsyncMessageArgs) => {
                this._logger.log(
                    "Async message received: " + event.message.type,
                );
                this.emit(MessagingEvents.ASYNC_MESSAGE, event);
                this._emitTypedMessage(event);
            },
        );
        this.messaging.addListener(
            MessageManagerEvents.EXTERNAL_MESSAGE,
            (event: AsyncMessageArgs) => {
                this._logger.log(
                    "External async message received: " + event.message.type,
                );
                this.emit(MessagingEvents.ASYNC_MESSAGE, event);
                this._emitTypedMessage(event);
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.PORT_MESSAGE,
            (message: Message) => {
                this._logger.log("Port message received: " + message.type);
                this.emit(MessagingEvents.MESSAGE, message);
                this._emitTypedMessage(message);
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.POPUP_DISCONNECTED,
            () => {
                this.emit(MessagingEvents.CLIENT_DISCONNECTED, {
                    client: "popup",
                });
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.CONTENT_DISCONNECTED,
            () => {
                this.emit(MessagingEvents.CLIENT_DISCONNECTED, {
                    client: "content",
                });
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.POPUP_CONNECTED,
            () => {
                this.emit(MessagingEvents.CLIENT_CONNECTED, {
                    client: "popup",
                } as ClientConnectionEvent);
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.CONTENT_CONNECTED,
            () => {
                this.emit(MessagingEvents.CLIENT_CONNECTED, {
                    client: "content",
                } as ClientConnectionEvent);
            },
        );
    }

    broadcastMessage(message: any) {
        this.portMessaging.broadcastMessage(message);
    }

    sendContentMessage(message: any) {
        this.portMessaging.sendContentMessage(message);
    }

    sendPopupMessage(message: any) {
        this.portMessaging.sendPopupMessage(message);
    }
}
