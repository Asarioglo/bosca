import { BGCoreServices } from "../../src/background/services/core-services";
import { MessagingService } from "../../src/background/services/messaging/messaging-service";
import { PluginMessagingService } from "../../src/background/services/messaging/plugin-messaging-service";
import { StorageService } from "../../src/background/services/storage/storage-service";
import { ServiceRegistry } from "../../src/common";
import getMockBrowser, { IMockBrowser } from "./mock-runtime";

export const getBaseServiceRegistry = (): [ServiceRegistry, IMockBrowser] => {
    const browser = getMockBrowser();
    const registry = new ServiceRegistry();
    const storageService = new StorageService(browser);
    const messagingService = new MessagingService(browser);
    const pluginMessagingService = new PluginMessagingService();
    registry.registerService(BGCoreServices.STORAGE, storageService);
    registry.registerService(BGCoreServices.MESSAGING, messagingService);
    registry.registerService(
        BGCoreServices.PLUGIN_MESSAGING,
        pluginMessagingService,
    );

    return [registry, browser];
};
