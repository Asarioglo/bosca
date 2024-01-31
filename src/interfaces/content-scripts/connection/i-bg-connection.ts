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
     * Should disconnect from the background script.
     */
    disconnect(): void;
    /**
     * Returns true if the connection is alive.
     */
    connected(): boolean;
    /**
     * If true, should attempt to reconnect if the connection is lost.
     * @param attemptReconnect
     */
    attemptReconnect(attemptReconnect: boolean): IBackgroundConnection;
    /**
     * If true, should ping the background script to keep the extension alive.
     * @param keepAlive
     */
    setKeepAlive(keepAlive: boolean): IBackgroundConnection;

    sendMessage(message: Message): void;

    onMessage(callback: MessageCallback): void;

    onDisconnect(callback: DisconnectCallback): void;

    setConnectionTimeout(timeout: number): IBackgroundConnection;
}
declare var IBackgroundConnection: {
    new (browser: IBrowser): IBackgroundConnection;
};
