import { Message } from "../../../interfaces/common/messaging/message";

export interface Connection {
    connect(): void;
    onMessage(callback: (message: Message) => void): void;
    onDisconnect(callback: () => void): void;
    sendMessage(message: Message): void;
}
