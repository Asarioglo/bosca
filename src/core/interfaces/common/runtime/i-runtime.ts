// 1. Interface Definition
export interface IRuntime {
    connect(options: { name: string }): IPort;

    onConnect: { addListener(callback: (port: IPort) => void): void };

    onConnectExternal: { addListener(callback: (port: IPort) => void): void };

    onMessage: {
        addListener(
            callback: (
                message: any,
                sender: any,
                sendResponse: Function,
            ) => boolean,
        ): void;
    };

    onMessageExternal: {
        addListener(
            callback: (
                message: any,
                sender: any,
                sendResponse: Function,
            ) => void,
        ): void;
    };

    onInstalled: {
        addListener(callback: (details: any) => void): void;
    };

    getManifest(): {
        version: string;
    };
}

export interface IPort {
    name: string;
    onMessage: { addListener(callback: (message: any) => void): void };
    onDisconnect: { addListener(callback: () => void): void };
    postMessage(message: any): void;
}
