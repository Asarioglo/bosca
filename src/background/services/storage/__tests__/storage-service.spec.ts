import { StorageService } from "../storage-service";
import { IStorage } from "../../../../interfaces/common/runtime/i-storage";
import getMockBrowser from "../../../../../tests/utils/mock-runtime";

describe("StorageService", () => {
    let storageService: StorageService;

    beforeEach(() => {
        // Create a mock implementation of IStorage
        const browser = getMockBrowser();

        // Create an instance of StorageService with the mock implementation
        storageService = new StorageService(browser);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("get", () => {
        it("should return the value from storage", async () => {
            // Arrange
            const key = "testKey";
            const value = "testValue";
            const browser = getMockBrowser();
            browser.storage.config = {
                [key]: value,
            };
            storageService = new StorageService(browser);

            // Act
            const result = await storageService.get<string>(key);

            // Assert
            expect(result).toBe(value);
            expect(browser.storage.get).toHaveBeenCalledWith(key);
        });

        it("should return null if the value is not found in storage", async () => {
            // Arrange
            const key = "testKey";
            const browser = getMockBrowser();
            storageService = new StorageService(browser);

            // Act
            const result = await storageService.get<string>(key);

            // Assert
            expect(result).toBeNull();
            expect(browser.storage.get).toHaveBeenCalledWith(key);
        });
    });

    describe("set", () => {
        it("should set the value in storage", async () => {
            // Arrange
            const key = "testKey";
            const value = "testValue";

            // Act
            await storageService.set(key, value);

            // Assert
            expect(storageService["_storage"].set).toHaveBeenCalledWith(
                key,
                value,
            );
        });
    });
});
