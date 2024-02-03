import { Message, SupportedConfigValues } from "../interfaces";
import { NotificationType } from "../common";

export enum CoreEvents {
    INSTALLED = "installed",
    CONFIG_CHANGED = "config-changed",
    USER_NOTIFICATION = "user-notification",
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
};

export type ConfigChangePayload = {
    [key: string]: {
        oldValue: SupportedConfigValues;
        newValue: SupportedConfigValues;
    };
};

export type ConfigChangeMessage = Message & {
    type: CoreEvents.CONFIG_CHANGED;
    payload: ConfigChangePayload;
};

export type UserNotificationPayload = {
    type: NotificationType;
    message: string;
};

export type UserNotificationMessage = Message & {
    type: CoreEvents.USER_NOTIFICATION;
    payload: UserNotificationPayload;
};
