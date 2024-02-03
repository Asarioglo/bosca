import { ConfigEntry, SupportedConfigValues } from "../interfaces";

export enum Actions {
    SET_CONFIG = "set-config",
}

export type SetConfigPayload = {
    key?: string;
    value?: SupportedConfigValues;
    config?: ConfigEntry;
};

export enum AsyncActions {
    GET_STATE = "get-state",
}
