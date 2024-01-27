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
