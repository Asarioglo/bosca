import { Chrome } from "./runtime/chrome/chrome";
import { ChromeRuntime } from "./runtime/chrome/chrome-runtime";
import { ChromeSyncStorage } from "./runtime/chrome/chrome-sync-storage";
import { ChromeWindows } from "./runtime/chrome/chrome-windows";

const chromeRT = {
    runtime: ChromeRuntime,
    windows: ChromeWindows,
    storage: ChromeSyncStorage,
    browser: Chrome,
};

import { GlobalMessageTypes } from "./messaging/global-message-types";
import { ServiceRegistry } from "./services/service-registry";
import { EventEmitter } from "./event-emitter";

export default {
    Runtimes: {
        Chrome: chromeRT,
    },
    GlobalMessageTypes,
    ServiceRegistry,
    EventEmitter,
};
