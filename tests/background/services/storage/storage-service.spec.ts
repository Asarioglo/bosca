import { StorageService } from "../../../../src/background/services/storage/storage-service";
import { IStorage } from "../../../../src/interfaces/common/runtime/i-storage";

describe("StorageService", () => {
    let storageService: StorageService;

    beforeEach(() => {
        // Create a mock implementation of IStorage
        const storageMock: any = {
            get: jest.fn(),
            set: jest.fn(),
        } as IStorage;

        // Create an instance of StorageService with the mock implementation
        storageService = new StorageService(storageMock);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("get", () => {
        it("should return the value from storage", async () => {
            // Arrange
            const key = "testKey";
            const value = "testValue";
            const storageMock = {
                get: jest.fn().mockResolvedValue(value),
                set: jest.fn(),
            };
            storageService = new StorageService(storageMock);

            // Act
            const result = await storageService.get<string>(key);

            // Assert
            expect(result).toBe(value);
            expect(storageMock.get).toHaveBeenCalledWith(key);
        });

        it("should return null if the value is not found in storage", async () => {
            // Arrange
            const key = "testKey";
            const storageMock = {
                get: jest.fn().mockResolvedValue(undefined),
                set: jest.fn(),
            };
            storageService = new StorageService(storageMock);

            // Act
            const result = await storageService.get<string>(key);

            // Assert
            expect(result).toBeNull();
            expect(storageMock.get).toHaveBeenCalledWith(key);
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
