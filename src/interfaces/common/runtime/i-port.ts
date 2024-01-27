export interface IPort {
    name: string;
    onMessage: { addListener(callback: (message: any) => void): void };
    onDisconnect: { addListener(callback: () => void): void };
    postMessage(message: any): void;
}
