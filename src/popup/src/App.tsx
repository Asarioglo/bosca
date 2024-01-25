import React, { useEffect } from "react";
import HeadingNoAuth from "./components/common/heading-no-auth";
import "./App.css";
import { useBackgroundState } from "./state/state-provider";
import MainPageTabs from "./pages/main-page-tabs";
import { useOverlay } from "./overlay/overlay-provider";

function App() {
    const { appState, initialized } = useBackgroundState();
    const { showLoading, hideOverlay } = useOverlay();

    useEffect(() => {
        if (!initialized) {
            showLoading(appState?.appName || "APP NAME");
        } else {
            hideOverlay();
        }
        console.log("State Changed to ", appState);
    }, [appState, initialized]);

    return (
        <div className="App">
            <HeadingNoAuth
                logoSrc={"app-logo.png"}
                title={appState?.appName?.toUpperCase() || "APP NAME"}
                height={"3rem"}
            />
            <MainPageTabs />
        </div>
    );
}

export default App;
