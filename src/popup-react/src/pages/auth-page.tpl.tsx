import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import styled from "@emotion/styled";
import { useAnalytics } from "../metrics/analytics-provider";

interface AuthPageProps {
    onAuthenticate?: () => void | null;
}

const LoginButton = styled(Button)`
    background-color: #4285f4;
    color: white;
    width: 100%;
    height: 3rem;
    font-size: 1.5rem;
`;

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticate }) => {
    const { sendMetric } = useAnalytics();

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="center"
            height="100%"
            padding="10%"
        >
            <Typography variant="h4" gutterBottom>
                Welcome to Dat-Empower!
            </Typography>
            <Typography color={"grey"} gutterBottom>
                Unleash the full potential of your trucking load board
                operations with Dat-Empower. Send one-click emails, track your
                contacted loads, and manage your operations seamlessly.
                <br />
                <br />
                Please log in to access your account and start streamlining your
                processes today.
            </Typography>
            <Box height="2em" width="100%" />
            <LoginButton
                onClick={onAuthenticate}
                onMouseEnter={() => sendMetric("log in button hovered")}
            >
                Log In
            </LoginButton>
        </Box>
    );
};

export default AuthPage;
