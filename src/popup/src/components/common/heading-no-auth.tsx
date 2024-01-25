import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import styled from "@emotion/styled";
// import { useOverlay } from "../../overlay/overlay-provider";

const Logo = styled("img")`
    max-height: 80%;
    max-width: 80%;
    object-fit: contain;
    margin-right: 1rem;
`;

interface CustomAppBarProps {
    logoSrc: string;
    title: string;
    height: string;
}

const HeadingNoAuth: React.FC<CustomAppBarProps> = ({
    logoSrc,
    title,
    height,
}) => {
    // const { showLoading, showWebpage } = useOverlay();

    const appBarStyles = {
        backgroundColor: "#fff",
        height: height,
    };

    const toolbarStyles = {
        minHeight: height,
        display: "flex",
        justifyContent: "space-between",
        paddingLeft: "0.5rem",
    };

    const leftDivStyles = {
        height: "100%",
        display: "flex",
        alignItems: "center",
    };

    return (
        <AppBar position="static" style={appBarStyles}>
            <Toolbar style={toolbarStyles}>
                <div style={leftDivStyles}>
                    <Logo src={logoSrc} alt={`${title} logo`} />
                    <Typography
                        variant="h6"
                        component="div"
                        color="#8E9AD0"
                        noWrap
                    >
                        {title}
                    </Typography>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default HeadingNoAuth;
