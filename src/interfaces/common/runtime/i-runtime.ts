import { IPort } from "./i-port";

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

    sendMessage(message: any, responseCallback?: (response: any) => void): void;

    lastError?: any;

    getURL(path: string): string;
}
