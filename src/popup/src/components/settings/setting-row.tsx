import { PropsWithChildren } from "react";
import { Box, Typography } from "@mui/material";

export type SettingRowProps = {
    label: string;
} & PropsWithChildren;

const SettingRow = ({ label, children }: SettingRowProps) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            padding="8px 0"
        >
            <Typography>{label}</Typography>
            {children}
        </Box>
    );
};

export default SettingRow;
