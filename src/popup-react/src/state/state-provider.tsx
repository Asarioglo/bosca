// BackgroundStateContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "./app-state";
import debugState from "./debug";
import BackgroundConnection, {
    Message,
} from "../services/bg-connection-service";

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

interface BackgroundState {
    appState: AppState | null;
    updateAppState: (partialAppState: RecursivePartial<AppState>) => void;
    sendMessage: (message: Message) => void;
    initialized: boolean;
}

const defaultState: BackgroundState = {
    appState: null,
    updateAppState: () => {},
    sendMessage: () => {},
    initialized: false,
};

const BackgroundStateContext = createContext<BackgroundState>(defaultState);

export const useBackgroundState = () => {
    return useContext(BackgroundStateContext);
};

export const BackgroundStateProvider = ({ children }: any) => {
    const [appState, setAppState] = useState<AppState | null>(null);
    const [initialized, setInitialized] = useState(false);

    const setPartialAppState = (state: Partial<AppState>) => {
        setAppState((prevState: AppState | null) => {
            if (!prevState) {
                return (state as AppState) || null;
            }
            return {
                ...prevState,
                ...state,
            };
        });
    };

    const sendMessage = (message: Message) => {
        const connection = BackgroundConnection.getInstance();
        if (connection.connected()) {
            connection.sendMessage(message);
        }
    };

    useEffect(() => {
        const refreshAppState = () => {
            if (!chrome.runtime) {
                setTimeout(() => {
                    setAppState(debugState);
                    setInitialized(true);
                }, 1000);
                return;
            } else {
                sendMessage({ type: "broadcast-state" });
            }
        };

        const messageListener = (message: Message) => {
            console.log("Received message", message);
            if (!message.type) {
                return;
            }
            if (message.type === "ack") {
                refreshAppState();
            }
            if (message.type === "config-changed") {
                if (message.payload && message.payload) {
                    setPartialAppState(message.payload as Partial<AppState>);
                }
                if (!initialized) {
                    setInitialized(true);
                }
            }
        };

        if (chrome.runtime) {
            chrome.runtime.onMessage.addListener(messageListener);
            const connection = BackgroundConnection.getInstance();
            connection.onMessage(messageListener);
            connection.connect();
        } else {
            refreshAppState();
        }

        return () => {
            if (chrome.runtime) {
                BackgroundConnection.getInstance().onMessage(null).disconnect();
            }
        };
    }, []);

    const updateAppState = (partialAppState: RecursivePartial<AppState>) => {
        sendMessage({
            type: "setConfigState",
            payload: {
                diffObj: partialAppState,
            },
        });
    };

    const value = {
        appState,
        updateAppState,
        initialized,
        sendMessage,
    };

    return (
        <BackgroundStateContext.Provider value={value}>
            {children}
        </BackgroundStateContext.Provider>
    );
};
