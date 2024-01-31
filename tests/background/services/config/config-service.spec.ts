import { ConfigService } from "../../../../src/background/services/config/config-service";

describe("ConfigService", () => {
    let configService: ConfigService;

    beforeEach(() => {
        configService = new ConfigService();
    });

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
});
