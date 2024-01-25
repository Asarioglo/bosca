import React from "react";
import { TextField, Box } from "@mui/material";
import SettingRow from "./setting-row";
import TextEdirorWithSave from "../common/text-editor-with-save";

interface TextSettingProps {
    label: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    isSaving?: boolean;
    onChange?: (value: string) => void;
    textTooltip?: string;
    saveTooltip?: string;
    cancelTooltip?: string;
    cantSaveTooltip?: string;
}

const TextSetting: React.FC<TextSettingProps> = ({
    label,
    defaultValue,
    onChange,
    placeholder,
    disabled,
    isSaving,
}) => {
    const handleChange = (text: string) => {
        if (onChange) {
            onChange(text);
        }
    };

    return (
        <SettingRow label={label}>
            <Box width={"50%"}>
                <TextEdirorWithSave
                    text={defaultValue || ""}
                    onTextSave={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    isSaving={isSaving || false}
                />
            </Box>
        </SettingRow>
    );
};

export default TextSetting;
