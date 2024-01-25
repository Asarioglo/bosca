import { ChromeRuntime } from "./chrome-runtime";
import { ChromeSyncStorage } from "./chrome-sync-storage";
import { ChromeWindows } from "./chrome-windows";

export const Chrome = {
    runtime: ChromeRuntime,
    windows: ChromeWindows,
    storage: ChromeSyncStorage,
};
