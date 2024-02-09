export interface IMessageDispatcher {
    addListener(msgType: string, listener: (msg: any) => void): void;
    broadcastMessage(msg: any): void;
    sendPopupMessage(msg: any): void;
    sendContentMessage(msg: any): void;
}
