import { Message } from "../../../../common/models/message";
import { EventEmitter } from "../event-emitter";

export interface IMessagingLayer extends EventEmitter {
    broadcastMessage: (message: Message) => void;
    sendContentMessage: (message: Message) => void;
    sendPopupMessage: (message: Message) => void;
}
