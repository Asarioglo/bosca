// AuthPage.tsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SettingsPage from "./settins-page";
import styled from "@emotion/styled";
import Settings from "@mui/icons-material/Settings";
import { AlternateEmail, LiveHelp } from "@mui/icons-material";
import HelpPage from "./help-page";

const VerticalTabsContainer = styled(Box)`
    width: 60px;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;
const VerticalContentsContainer = styled(Box)`
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
`;

const TabButton = styled(Tab)`
    min-width: 60px;
    max-width: 60px;
    min-height: 80px;
    font-size: 0.5rem;
`;

const MainPageTabs = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Box
            display="flex"
            flexDirection="row"
            height="calc(100% - 48px)"
            className="main-page-tabs-container"
        >
            <VerticalTabsContainer className="vertical-tabs-container">
                <Tabs
                    orientation="vertical"
                    value={tabIndex}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="Tabs"
                >
                    <TabButton icon={<Settings />} label="Settings" value={0} />
                    <TabButton icon={<LiveHelp />} label="Help" value={1} />
                </Tabs>
            </VerticalTabsContainer>
            <VerticalContentsContainer>
                {tabIndex === 0 && <SettingsPage />}
                {tabIndex === 1 && <HelpPage />}
            </VerticalContentsContainer>
        </Box>
    );
};

export default MainPageTabs;
