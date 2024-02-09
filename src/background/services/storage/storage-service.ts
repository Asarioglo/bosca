import { IBrowser, IService, IServiceProvider } from "../../../interfaces";
import { IStorage } from "../../../interfaces/common/runtime/i-storage";

export class StorageService implements IService {
    private _storage!: IStorage;
    constructor(browser: IBrowser) {
        this._storage = browser.storage;
    }

    async start(
        browser: IBrowser,
        serviceProvider: IServiceProvider,
    ): Promise<void> {}

    isReady(): boolean {
        return this._storage !== undefined;
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.isReady()) {
            throw new Error("Storage service is not ready");
        }
        return (await this._storage.get(key)) || null;
    }

    async set(key: string, value: any): Promise<void> {
        if (!this.isReady()) {
            throw new Error("Storage service is not ready");
        }
        return await this._storage.set(key, value);
    }
}
