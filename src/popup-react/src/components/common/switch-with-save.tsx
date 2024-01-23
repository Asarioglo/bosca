import { Box, Switch, CircularProgress } from "@mui/material";
import HelperTooltip from "./helper-tooltip";
import React, { useState, useEffect } from "react";

type SwitchFieldParams = {
    checked: boolean;
    isChanging: boolean;
    onSwitchChange: (checked: boolean) => void;
    tooltip?: string;
    disabled?: boolean;
};

const ProgressIndicator = () => (
    <CircularProgress
        size={20}
        sx={{
            color: "#000",
            padding: "0 0.5rem",
        }}
    />
);

const SwitchWithSave = ({
    checked,
    isChanging,
    onSwitchChange,
    tooltip,
    disabled,
}: SwitchFieldParams) => {
    const [checkedInternal, setCheckedInternal] = useState(checked);

    useEffect(() => {
        setCheckedInternal(checked);
    }, [checked]);

    const handleSwitchChange = (event: any) => {
        const newChecked = event.target.checked;
        setCheckedInternal(newChecked);
        onSwitchChange(newChecked);
    };

    return (
        <Box minWidth={"3.6em"}>
            {isChanging ? (
                <ProgressIndicator />
            ) : (
                <HelperTooltip title={tooltip || "Enable/Disable"}>
                    <Switch
                        checked={checkedInternal}
                        onChange={handleSwitchChange}
                        disabled={disabled}
                    />
                </HelperTooltip>
            )}
        </Box>
    );
};

export default SwitchWithSave;
