import React from "react";

import { Box, Typography } from "@mui/material";
import { Telegram, Email, Language } from "@mui/icons-material";
import HelperTooltip from "../common/helper-tooltip";
import styled from "@emotion/styled";
import SectionHeading from "../common/page-section-heading";
import { useAnalytics } from "../../metrics/analytics-provider";
import { useBackgroundState } from "../../state/state-provider";

const ContactRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1em 0;
    &:hover {
        background-color: #eee;
    }
`;

const ContactButtonsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const ContactButton = styled.div`
    height: 100%;
    width: 50px;
    margin-left: 0.5em;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ContactUs = () => {
    const { appState } = useBackgroundState();
    const { sendMetric } = useAnalytics();

    const logContact = (type: string) => {
        sendMetric(`${type} contact button clicked`);
    };

    const logHover = (type: string) => {
        sendMetric(`${type} contact button hovered`);
    };

    return (
        <ContactRow>
            <SectionHeading fontWeight={"bold"} align="left">
                Contact Us
            </SectionHeading>
            <ContactButtonsContainer>
                {appState?.contactEmail && (
                    <a
                        href={`mailto:${appState?.contactEmail}`}
                        onClick={() => logContact("email")}
                        onMouseEnter={() => logHover("email")}
                    >
                        <HelperTooltip
                            title={`Email ${appState?.contactEmail}`}
                        >
                            <ContactButton>
                                <Email color="primary" />
                            </ContactButton>
                        </HelperTooltip>
                    </a>
                )}
                {appState?.website && (
                    <a
                        href={appState?.website}
                        rel="noopener noreferrer"
                        target="_blank"
                        onClick={() => logContact("website")}
                        onMouseEnter={() => logHover("website")}
                    >
                        <HelperTooltip
                            title={`Visit ${
                                appState?.appName || "Bosca"
                            } Webpage`}
                        >
                            <ContactButton>
                                <Language color="primary" />
                            </ContactButton>
                        </HelperTooltip>
                    </a>
                )}
                {appState?.telegram && (
                    <a
                        href={appState.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => logContact("telegram")}
                        onMouseEnter={() => logHover("telegram")}
                    >
                        <HelperTooltip title="Join our Telegram Channel">
                            <ContactButton>
                                <Telegram color="primary" />
                            </ContactButton>
                        </HelperTooltip>
                    </a>
                )}
            </ContactButtonsContainer>
        </ContactRow>
    );
};

export default ContactUs;
