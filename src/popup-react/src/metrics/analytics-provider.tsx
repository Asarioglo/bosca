import React, { createContext, useContext, PropsWithChildren } from "react";
import { useBackgroundState } from "../state/state-provider";

type AnalyticsState = {
    sendMetric: (metric: string, data?: any) => void;
};

const defaultState: AnalyticsState = {
    sendMetric: () => {},
};

// Create a new context
const AnalyticsContext = createContext(defaultState);

// Analytics Provider Component
export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
    const { sendMessage } = useBackgroundState();

    const sendMetric = (metric: string, data?: any) => {
        if (chrome.runtime) {
            sendMessage({
                type: "log-metric",
                payload: {
                    metric: "(popup) " + metric,
                    data,
                },
            });
        } else {
            console.log("Metric", metric, data);
        }
    };

    return (
        <AnalyticsContext.Provider value={{ sendMetric }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

// Hook to use the overlay context
export const useAnalytics = () => useContext(AnalyticsContext);
