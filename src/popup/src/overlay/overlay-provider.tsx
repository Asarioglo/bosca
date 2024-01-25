import styled from "@emotion/styled";
import React, {
    createContext,
    useState,
    useContext,
    useRef,
    PropsWithChildren,
} from "react";
import { Button, CircularProgress, Typography } from "@mui/material";

type OverlayState = {
    showWebpage: (url: string, title?: string) => void;
    showLoading: (title?: string) => void;
    hideOverlay: () => void;
};

const defaultState: OverlayState = {
    showWebpage: () => {},
    showLoading: () => {},
    hideOverlay: () => {},
};

// Create a new context
const OverlayContext = createContext(defaultState);

const ModalContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    backdrop-filter: blur(10px) brightness(0.7);
    z-index: 1;
`;

const OverlayContainer = styled.div`
    position: absolute;
    top: 40px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
`;

const CloseButton = styled(Button)`
    position: absolute;
    top: 0px;
    right: 0px;
    cursor: pointer;
    z-index: 10;
    color: white;
    font-weight: bold;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 3;
    align-items: center;
    justify-content: center;
`;

const LoadingText = styled(Typography)`
    margin-top: 20px;
    color: white;
    font-size: 1.2em;
`;

const ContentFrame = styled.iframe`
    width: 100%;
    height: 100%;
    z-index: 4;
    border-radius: 5px;
    outline: none;
    border: none;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
`;

// Overlay Provider Component
export const OverlayProvider = ({ children }: PropsWithChildren) => {
    const [isActive, setIsActive] = useState(false);
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [withIframe, setWithIframe] = useState(false);
    const overlayRef = useRef(null);

    const showWebpage = (url: string, title?: string) => {
        setWithIframe(true);
        showOverlay(url, title);
    };

    const showLoading = (title?: string) => {
        setWithIframe(false);
        showOverlay("", title);
    };

    // The function to show the overlay with the given URL
    const showOverlay = (url: string, title?: string) => {
        setIsActive(true);
        setUrl(url);
        if (title) setTitle(title);
    };

    // The function to hide the overlay
    const hideOverlay = () => {
        setIsActive(false);
        setUrl("");
        setTitle("");
    };

    return (
        <OverlayContext.Provider
            value={{ showWebpage, showLoading, hideOverlay }}
        >
            {children}
            {isActive && (
                <ModalContainer>
                    <CloseButton className="close-btn" onClick={hideOverlay}>
                        X
                    </CloseButton>
                    <OverlayContainer
                        ref={overlayRef}
                        className="iframe-overlay-container"
                    >
                        <LoadingContainer>
                            <CircularProgress disableShrink size="5rem" />
                            <LoadingText>Loading {title}</LoadingText>
                        </LoadingContainer>
                        {withIframe && (
                            <ContentFrame
                                className="iframe-content"
                                src={url}
                                title="Overlay Content"
                            ></ContentFrame>
                        )}
                    </OverlayContainer>
                </ModalContainer>
            )}
        </OverlayContext.Provider>
    );
};

// Hook to use the overlay context
export const useOverlay = () => useContext(OverlayContext);
