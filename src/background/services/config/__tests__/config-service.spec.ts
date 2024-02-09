import { CoreEvents } from "../../../core-events";
import { ConfigService } from "../config-service";
import { BGCoreServices } from "../../core-services";
import { MessagingService } from "../../messaging/messaging-service";
import { PluginMessagingService } from "../../messaging/plugin-messaging-service";
import { ServiceRegistry } from "../../../../common/services/service-registry";
import { IBrowser, IConfig, IRuntime } from "../../../../interfaces";
import getMockBrowser, {
    MockStorage,
} from "../../../../../tests/utils/mock-runtime";
import { StorageService } from "../../storage/storage-service";
import { getBaseServiceRegistry } from "../../../../../tests/utils/base-service-registry";

describe("ConfigService", () => {
    let configService: ConfigService<any>;
    let browser: IBrowser;
    let svcProvider: ServiceRegistry;
    let messagingSvc: MessagingService;
    let pluginSvc: PluginMessagingService;

    beforeEach(async () => {
        const [svc, bw] = getBaseServiceRegistry();
        svcProvider = svc;
        browser = bw;
        messagingSvc = svcProvider.getService<MessagingService>(
            BGCoreServices.MESSAGING,
        )!;
        pluginSvc = svcProvider.getService<PluginMessagingService>(
            BGCoreServices.PLUGIN_MESSAGING,
        )!;

        configService = new ConfigService("testId");
        await configService.start(browser, svcProvider);
        await svcProvider.startServices(browser);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should raise when not initialized", async () => {
        const service = new ConfigService("testId");
        expect(service.isReady()).toBe(false);
        await expect(service.load()).rejects.toThrow();
        await expect(service.set("testKey", "testValue")).rejects.toThrow();
    });

    it("should initialize from a config object", async () => {
        const config = {
            extensionId: "testId",
            key1: "value1",
            key2: "value2",
            key3: "value3",
            key4: {
                key5: "value5",
                key6: {
                    key7: "value7",
                },
            },
        };

        const configService = new ConfigService("testId");
        await configService.start(browser, svcProvider);
        await configService.set(config as any);

        expect(configService.get("key1")).toEqual("value1");
        expect(configService.get("key2")).toEqual("value2");
        expect(configService.get("key3")).toEqual("value3");
        expect(configService.get("key4.key5")).toEqual("value5");
        expect(configService.get("key4.key6.key7")).toEqual("value7");
    });

    it("should initialize and load in correct sequence", async () => {
        (browser.storage as MockStorage).config = {
            testId_config: {
                testKey: "testValue",
                testKey2: "testValue2",
            },
        };
        const service = new ConfigService("testId");
        await service.start(browser, svcProvider);

        service.set("testKey3", "testValue", true);
        await service.load();
        expect(service.get("testKey")).toEqual("testValue");
        expect(service.get("testKey2")).toEqual("testValue2");
        expect(service.get("testKey3")).toEqual("testValue");
        expect(browser.storage.get).toHaveBeenCalledWith("testId_config");
        expect((browser.storage as MockStorage).config).toEqual({
            testId_config: {
                testKey: "testValue",
                testKey2: "testValue2",
                testKey3: "testValue",
            },
        });
    });

    it("should set and get a config value", async () => {
        const key = "testKey";
        const value = "testValue";

        await configService.set(key, value);
        const result = configService.get(key);

        expect(result).toEqual(value);
    });

    it("should set multiple config values", async () => {
        const config = {
            key1: "value1",
            key2: "value2",
            key3: "value3",
        };

        await configService.set(config as any);

        expect(configService.get("key1")).toEqual("value1");
        expect(configService.get("key2")).toEqual("value2");
        expect(configService.get("key3")).toEqual("value3");
    });

    it("should set from its own output.format", async () => {
        await configService.set({
            a: {
                b: {
                    c: "value1",
                },
            },
        });
        expect(configService.get("a.b.c")).toEqual("value1");

        await configService.set({
            "a.b.c": "value2",
            "d.e.f": "value3",
        });
        expect(configService.get("a.b.c")).toEqual("value2");
        expect(configService.get("d.e.f")).toEqual("value3");
    });

    it("should return null for non-existing config key", () => {
        const result = configService.get("nonExistingKey");

        expect(result).toBeNull();
    });

    it("should override existing config value", async () => {
        const key = "testKey";
        const value = "testValue";
        const newValue = "newTest";
        await configService.set(key, value);
        expect(configService.get(key)).toEqual(value);
        await configService.set(key, newValue);
        expect(configService.get(key)).toEqual(newValue);
    });

    it("should set nested configs", async () => {
        const config = {
            key1: "value1",
            key2: {
                key3: "value3",
                key4: "value4",
            },
        };

        await configService.set(config as any);

        expect(configService.get("key1")).toEqual("value1");
        expect(configService.get("key2")).toBeNull();
        expect(configService.get("key2.key3")).toEqual("value3");
    });

    it("should broadcast config change", async () => {
        const key = "testKey";
        const value = "testValue";
        const newValue = "newTest";
        jest.spyOn(messagingSvc, "broadcastMessage");
        jest.spyOn(pluginSvc, "emit");

        // Test that value is broadcasted from nothing to value
        await configService.set(key, value);
        expect(messagingSvc.broadcastMessage).toHaveBeenCalled();
        expect(pluginSvc.emit).toHaveBeenCalled();
        expect(messagingSvc.broadcastMessage).toHaveBeenCalledWith({
            type: CoreEvents.CONFIG_CHANGED,
            payload: { [key]: { oldValue: null, newValue: value } },
        });
        expect(pluginSvc.emit).toHaveBeenCalledWith(CoreEvents.CONFIG_CHANGED, {
            [key]: { oldValue: null, newValue: value },
        });
        jest.clearAllMocks();

        // Test that value is broadcasted from value to new value
        await configService.set(key, newValue);
        expect(messagingSvc.broadcastMessage).toHaveBeenCalled();
        expect(pluginSvc.emit).toHaveBeenCalled();
        expect(messagingSvc.broadcastMessage).toHaveBeenCalledWith({
            type: CoreEvents.CONFIG_CHANGED,
            payload: { [key]: { oldValue: value, newValue: newValue } },
        });
        expect(pluginSvc.emit).toHaveBeenCalledWith(CoreEvents.CONFIG_CHANGED, {
            [key]: { oldValue: value, newValue: newValue },
        });

        // Test that same value is not broadcasted
        jest.clearAllMocks();
        await configService.set(key, newValue);
        expect(messagingSvc.broadcastMessage).not.toHaveBeenCalled();
        expect(pluginSvc.emit).not.toHaveBeenCalled();

        // Test that nested value is broadcasted
        jest.clearAllMocks();
        await configService.set({
            key1: {
                key2: {
                    key3: "value3",
                },
            },
        } as any);
        expect(messagingSvc.broadcastMessage).toHaveBeenCalled();
        expect(pluginSvc.emit).toHaveBeenCalled();
        expect(messagingSvc.broadcastMessage).toHaveBeenCalledWith({
            type: CoreEvents.CONFIG_CHANGED,
            payload: {
                "key1.key2.key3": {
                    oldValue: null,
                    newValue: "value3",
                },
            },
        });
    });
});
