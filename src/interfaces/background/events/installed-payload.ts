export type InstalledReason =
    | "install"
    | "update"
    | "browser_update"
    | "chrome_update"
    | "shared_module_update";

export type IInstalledPayload = {
    reason: string;
    previousVersion: string;
};
