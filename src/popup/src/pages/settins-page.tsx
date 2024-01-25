import React, { useEffect } from "react";
import { useBackgroundState } from "../state/state-provider";
import { useState } from "react";
import { Typography } from "@mui/material";
import PageContainer from "../components/common/page-container";
import PageHeading from "../components/common/page-heading";
import SettingRow from "../components/settings/setting-row";
import SwitchWithSave from "../components/common/switch-with-save";
import PageSubheading from "../components/common/page-subheading";
import { useAnalytics } from "../metrics/analytics-provider";

const SettingsPage = () => {
    const { appState, sendMessage } = useBackgroundState();

    const [debugMode, setDebugMode] = useState(false);
    const [savingDebugMode, setSavingDebugMode] = useState(false);
    const { sendMetric } = useAnalytics();

    useEffect(() => {
        sendMetric("settings page opened");

        return () => {
            sendMetric("settings page closed");
        };
    }, [sendMetric]);

    useEffect(() => {
        if (!appState) {
            return;
        }
        setDebugMode(appState.debugMode || false);
    }, [appState]);

    const getChangeHandler =
        (
            setter: React.Dispatch<React.SetStateAction<any>>,
            savingChangeIndicator: React.Dispatch<
                React.SetStateAction<boolean>
            >,
            propName: string,
        ) =>
        (value: any) => {
            let stateObject = {} as any;
            stateObject[propName] = value;

            savingChangeIndicator(true);

            if (chrome.runtime) {
                chrome.runtime.sendMessage(
                    {
                        type: "user:save-settings",
                        payload: stateObject,
                    },
                    (result: any) => {
                        // TODO: If an error happens here, the UI doesn't reflect it
                        const success = result?.user?.settingsSaved;
                        if (success) {
                            setter(value);
                            console.log(
                                "Sender enabled state changed successfully",
                            );
                        } else {
                            console.error(
                                "Error changing sender enabled",
                                result?.message,
                            );
                        }
                        savingChangeIndicator(false);
                    },
                );
            } else {
                console.log("No chrome.runtime");
                setter(value);
                setTimeout(() => savingChangeIndicator(false), 1000);
            }
        };

    return (
        <PageContainer>
            <PageHeading>
                <Typography variant="h6">Settings</Typography>
            </PageHeading>
            <PageSubheading>
                The settings should be a part of the background state and this
                page is the UI for that state.
            </PageSubheading>
            <SettingRow label="Testing Mode">
                <SwitchWithSave
                    checked={debugMode}
                    onSwitchChange={getChangeHandler(
                        setDebugMode,
                        setSavingDebugMode,
                        "debugMode",
                    )}
                    isChanging={savingDebugMode}
                />
            </SettingRow>
        </PageContainer>
    );
};

export default SettingsPage;
