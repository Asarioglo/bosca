import { Tooltip, TooltipProps } from "@mui/material";

const HelperTooltip = (params: TooltipProps) => (
    <Tooltip {...params} enterDelay={500} />
);

export default HelperTooltip;
