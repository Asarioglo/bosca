import React from "react";
import { Switch, Box, CircularProgress } from "@mui/material";
import SettingRow from "./setting-row";

const ProgressIndicator = () => (
    <CircularProgress
        size={20}
        sx={{
            color: "#000",
        }}
    />
);

interface BooleanSettingProps {
    label: string;
    defaultValue?: boolean;
    isChanging?: boolean;
    onChange?: (value: boolean) => void;
}

const BooleanSetting: React.FC<BooleanSettingProps> = ({
    label,
    defaultValue,
    isChanging,
    onChange,
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(event.target.checked);
        }
    };

    return (
        <SettingRow label={label}>
            {isChanging ? (
                <ProgressIndicator />
            ) : (
                <Switch
                    checked={defaultValue}
                    onChange={handleChange}
                    color="primary"
                />
            )}
        </SettingRow>
    );
};

export default BooleanSetting;
