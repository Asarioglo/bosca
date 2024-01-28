export interface IPort {
    name: string;
    onMessage: {
        addListener(callback: (message: any) => void): void;
        removeListener(callback: (message: any) => void): void;
    };
    onDisconnect: {
        addListener(callback: () => void): void;
        removeListener(callback: () => void): void;
    };
    postMessage(message: any): void;
    disconnect(): void;
}
