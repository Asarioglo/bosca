import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BackgroundStateProvider } from "./state/state-provider";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { OverlayProvider } from "./overlay/overlay-provider";
import styled from "@emotion/styled";
import { AnalyticsProvider } from "./metrics/analytics-provider";

const ApplicationContainer = styled("div")`
    width: 600px;
    max-height: 600px;
    height: 600px;
    position: relative;
`;

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);
root.render(
    <React.StrictMode>
        <ApplicationContainer>
            <BackgroundStateProvider>
                <OverlayProvider>
                    <AnalyticsProvider>
                        <App />
                    </AnalyticsProvider>
                </OverlayProvider>
            </BackgroundStateProvider>
        </ApplicationContainer>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
