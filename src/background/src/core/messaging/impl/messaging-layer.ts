import { Message } from "../../../../../common/models/message";
import { IRuntime } from "../../../../../common/runtime/i-runtime";
import { EventEmitter } from "../../event-emitter";
import Logger from "../../utils/logger";
import {
    AsyncMessageArgs,
    MessageManager,
    MessageManagerEvents,
} from "./messaging-manager";
import { PortManager, PortManagerEvents } from "./port-manager";

export enum MessagingLayerEvents {
    ASYNC_MESSAGE = "async-message",
    MESSAGE = "message",
    CLIENT_CONNECTED = "client-connected",
    CLIENT_DISCONNECTED = "client-disconnected",
}

export type ClientConnectionEvent = {
    client: "popup" | "content";
};

export class MessagingLayer extends EventEmitter {
    private messaging: MessageManager;
    private portMessaging: PortManager;
    private _logger: Logger = new Logger("MessagingLayer");

    constructor(runtime: IRuntime) {
        super();
        this.messaging = new MessageManager(runtime);
        this.portMessaging = new PortManager(runtime);
        this._connect();
    }

    private _connect() {
        this.messaging.addListener(
            MessageManagerEvents.MESSAGE,
            (event: AsyncMessageArgs) => {
                this._logger.log(
                    "Port message received: " + event.message.type,
                );
                this.emit(MessagingLayerEvents.ASYNC_MESSAGE, event);
            },
        );
        this.messaging.addListener(
            MessageManagerEvents.EXTERNAL_MESSAGE,
            (event: AsyncMessageArgs) => {
                this.emit(MessagingLayerEvents.MESSAGE, event.message);
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.PORT_MESSAGE,
            (message: Message) => {
                this._logger.log("Port message received: " + message.type);
                this.emit(MessagingLayerEvents.MESSAGE, message);
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.POPUP_DISCONNECTED,
            () => {
                this.emit(MessagingLayerEvents.CLIENT_DISCONNECTED, {
                    client: "popup",
                });
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.CONTENT_DISCONNECTED,
            () => {
                this.emit(MessagingLayerEvents.CLIENT_DISCONNECTED, {
                    client: "content",
                });
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.POPUP_CONNECTED,
            () => {
                this.emit(MessagingLayerEvents.CLIENT_CONNECTED, {
                    client: "popup",
                });
            },
        );
        this.portMessaging.addListener(
            PortManagerEvents.CONTENT_CONNECTED,
            () => {
                this.emit(MessagingLayerEvents.CLIENT_CONNECTED, {
                    client: "content",
                });
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
