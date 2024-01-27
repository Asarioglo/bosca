import { Message } from "../../common/messaging/message";
import { IBrowser } from "../../common/runtime/i-browser";

export type MessageCallback = (message: Message) => void;

export type DisconnectCallback = () => void;

export interface IBackgroundConnection {
    /**
     * Should initialize a connection to the background script.
     */
    connect(): Promise<IBackgroundConnection>;
    /**
     * If true, should ping the background script to keep the extension alive.
     * @param keepAlive
     */
    setKeepAlive(keepAlive: boolean): IBackgroundConnection;

    sendMessage(message: Message): void;

    onMessage(callback: MessageCallback): void;

    onDisconnect(callback: DisconnectCallback): void;
}
declare var IBackgroundConnection: {
    new (browser: IBrowser): IBackgroundConnection;
};
