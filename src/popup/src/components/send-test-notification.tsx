import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { Message } from "../services/bg-connection-service";
import { useBackgroundState } from "../state/state-provider";

export type SendDebugEmailParams = {
    debugRecepient: string;
};

export default function SendTestNotification() {
    const { sendMessage } = useBackgroundState();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const notifications = [
        { type: "success", message: "This is a success notification" },
        { type: "info", message: "This is an info notification" },
        { type: "warning", message: "This is a warning notification" },
        { type: "error", message: "This is an error notification" },
    ];

    const sendTestNotificationHandler = (payload: any) => {
        sendMessage({
            type: "user-notification",
            payload,
        } as Message);

        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                aria-controls="send-test-notification-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                Choose a Type
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {notifications.map((notification) => (
                    <MenuItem
                        key={notification.type}
                        onClick={() =>
                            sendTestNotificationHandler(notification)
                        }
                    >
                        {notification.type}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
