import React from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import styled from "@emotion/styled";
import { FormatListBulleted, ContentCopy } from "@mui/icons-material";
import { useAnalytics } from "../metrics/analytics-provider";

const VariableMenuItem = styled(MenuItem)`
    position: relative;
    display: flex;
    flex-direction: column;
    &:hover {
        .copy-icon {
            display: block;
        }
    }
`;

const VariableRow = styled(Box)`
    display: flex;
    width: 400px;
    justify-content: space-between;
    align-items: center;
`;

const ExplanationRow = styled(VariableRow)`
    color: #666;
    padding-top: 5px;
    font-size: 0.8em;
`;

const CopyIcon = styled(ContentCopy)`
    display: none;
    position: absolute;
    right: 5px;
    font-size: 1.5em;
    top: 10px;
    color: black;
`;

const VariableName = styled(Box)``;

const VariableExample = styled(Box)`
    font-size: 0.8em;
    color: #666;
`;

const CaretDown = styled(FormatListBulleted)`
    font-size: 1.2em;
    margin-left: 10px;
`;

export default function EmailVariablesList() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { sendMetric } = useAnalytics();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        sendMetric("email variables list opened");
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        sendMetric("email variables list closed");
        setAnchorEl(null);
    };

    const copyVairableHandler = (variable: string) => {
        sendMetric(`email variable copied: ${variable}`);
        // copies the provided string to clipboard
        navigator.clipboard.writeText(variable);
        handleClose();
    };

    const variables = [
        {
            name: "phone",
            example: "(123) 456-6790",
            explanation:
                "Phone number from load contact. Empty if email contact instead.",
        },
        {
            name: "email",
            example: "dat.empower@gmail.com",
            explanation:
                "Email address from load contact. Empty if phone contact instead.",
        },
        {
            name: "origin",
            example: "New York, NY",
            explanation: "The origin city of the load",
        },
        {
            name: "destination",
            example: "Houston, TX",
            explanation: "The destination city of the load",
        },
        {
            name: "rate",
            example: "2000",
            explanation: "The total price offered for the load",
        },
        {
            name: "length",
            example: "53ft",
            explanation: "The length of the trailer required",
        },
        {
            name: "weight",
            example: "46,092lb",
            explanation: "The total weight of the load",
        },
        {
            name: "tripLength",
            example: "2500",
            explanation: "Number of miles from origin to destination",
        },
        {
            name: "totalMiles",
            example: "3000",
            explanation: "Number of miles including the deadhead",
        },
        {
            name: "deadhead",
            example: "500",
            explanation: "The deadhead for this load",
        },
        {
            name: "rpm",
            example: "2.1",
            explanation: "Rate Per Mile: amount per mile of the trip length",
        },
        {
            name: "trpm",
            example: "1.9",
            explanation:
                "True RPM: amount per mile of the total miles (including deadhead)",
        },
        {
            name: "available",
            example: "07/23",
            explanation: "Date of the load availability in form 'mm/dd'",
        },
        {
            name: "reference",
            example: "000AWYVF",
            explanation:
                "Reference number, only present if load has been expanded",
        },
    ];

    return (
        <div>
            <Button
                aria-controls="send-debug-email-menu"
                aria-haspopup="true"
                variant="outlined"
                onClick={handleClick}
            >
                Variables
                <CaretDown />
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{ maxHeight: "400px" }}
            >
                {variables.map((variable) => (
                    <VariableMenuItem
                        key={variable.name}
                        onClick={() =>
                            copyVairableHandler(`{${variable.name}}`)
                        }
                        className="menu-item"
                    >
                        <VariableRow>
                            <VariableName>{`{${variable.name}}`}</VariableName>
                            <VariableExample>
                                Ex: {variable.example}
                                <CopyIcon className="copy-icon" />
                            </VariableExample>
                        </VariableRow>
                        <ExplanationRow>{variable.explanation}</ExplanationRow>
                    </VariableMenuItem>
                ))}
            </Menu>
        </div>
    );
}
