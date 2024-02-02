import { Message } from "../interfaces";

export enum CoreEvents {
    INSTALLED = "installed",
    CONFIG_CHANGED = "config-changed",
}

export type InstalledReason =
    | "install"
    | "update"
    | "browser_update"
    | "chrome_update"
    | "shared_module_update";

export type InstalledPayload = {
    reason: string;
    previousVersion: string;
};

export type InstalledMessage = Message & {
    type: CoreEvents.INSTALLED;
    payload: InstalledPayload;
}

export type ConfigChangePayload = {
    [key: string]: {
        oldValue: any;
        newValue: any;
    };
}

export type ConfigChangeMessage = Message & {
    type: CoreEvents.CONFIG_CHANGED;
    payload: ConfigChangePayload;
}