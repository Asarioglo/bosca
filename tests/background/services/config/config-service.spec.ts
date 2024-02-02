import { CoreEvents } from "../../../../src/background/core-events";
import { ConfigService } from "../../../../src/background/services/config/config-service";
import { BGCoreServices } from "../../../../src/background/services/core-services";
import { MessagingService } from "../../../../src/background/services/messaging/messaging-service";
import { PluginMessagingService } from "../../../../src/background/services/messaging/plugin-messaging-service";
import { ServiceRegistry } from "../../../../src/common/services/service-registry";
import { IRuntime } from "../../../../src/interfaces";
import getMockBrowser from "../../../common/mock-runtime";

describe("ConfigService", () => {
    let configService: ConfigService;
    let runtime: IRuntime;
    let messagingSvc: MessagingService; 
    let pluginSvc: PluginMessagingService;
    let svcProvider: ServiceRegistry;

    beforeEach(() => {
        svcProvider = new ServiceRegistry();
        configService = new ConfigService(svcProvider, {"test": "test1"});
        runtime = getMockBrowser().runtime;
        messagingSvc = new MessagingService(runtime);
        pluginSvc = new PluginMessagingService(svcProvider);
        svcProvider.registerService(BGCoreServices.MESSAGING, messagingSvc);
        svcProvider.registerService(BGCoreServices.PLUGIN_MESSAGING, pluginSvc);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should initialize from a config object", () => {
        const config = {
            key1: "value1",
            key2: "value2",
            key3: "value3",
        };

        const configService = new ConfigService(svcProvider, config);

        expect(configService.get("key1")).toEqual("value1");
        expect(configService.get("key2")).toEqual("value2");
        expect(configService.get("key3")).toEqual("value3");
    })

    it("should set and get a config value", () => {
        const key = "testKey";
        const value = "testValue";

        configService.set(key, value);
        const result = configService.get(key);

        expect(result).toEqual(value);
    });

    it("should set multiple config values", () => {
        const config = {
            key1: "value1",
            key2: "value2",
            key3: "value3",
        };

        configService.set(config);

        expect(configService.get("key1")).toEqual("value1");
        expect(configService.get("key2")).toEqual("value2");
        expect(configService.get("key3")).toEqual("value3");
    });

    it("should return null for non-existing config key", () => {
        const result = configService.get("nonExistingKey");

        expect(result).toBeNull();
    });

    it("should override existing config value", () => {
        const key = "testKey";
        const value = "testValue";
        const newValue = "newTest";
        configService.set(key, value);
        expect(configService.get(key)).toEqual(value);
        configService.set(key, newValue);
        expect(configService.get(key)).toEqual(newValue);
    });

    it("should broadcast config change", () => {
        const key = "testKey";
        const value = "testValue";
        const newValue = "newTest";
        jest.spyOn(messagingSvc, "broadcastMessage");
        jest.spyOn(pluginSvc, "emit");

        configService.set(key, value);
        expect(messagingSvc.broadcastMessage).toHaveBeenCalled();
        expect(pluginSvc.emit).toHaveBeenCalled();
        expect(messagingSvc.broadcastMessage).toHaveBeenCalledWith({
            type: CoreEvents.CONFIG_CHANGED,
            payload: { [key]: { oldValue: null, newValue: value } },
        });
        expect(pluginSvc.emit).toHaveBeenCalledWith(CoreEvents.CONFIG_CHANGED, { [key]: { oldValue: null, newValue: value } });
        jest.clearAllMocks();

        configService.set(key, newValue);
        expect(messagingSvc.broadcastMessage).toHaveBeenCalled();
        expect(pluginSvc.emit).toHaveBeenCalled();
        expect(messagingSvc.broadcastMessage).toHaveBeenCalledWith({
            type: CoreEvents.CONFIG_CHANGED,
            payload: { [key]: { oldValue: value, newValue: newValue } },
        });
        expect(pluginSvc.emit).toHaveBeenCalledWith(CoreEvents.CONFIG_CHANGED, { [key]: { oldValue: value, newValue: newValue } });
    });
});
