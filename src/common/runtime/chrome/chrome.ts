import { ChromeExtension } from "./chrome-extension";
import { ChromeRuntime } from "./chrome-runtime";
import { ChromeSyncStorage } from "./chrome-sync-storage";
import { ChromeWindows } from "./chrome-windows";

export const ChromeBrowser = {
    runtime: ChromeRuntime,
    windows: ChromeWindows,
    storage: ChromeSyncStorage,
    extension: ChromeExtension,
};
