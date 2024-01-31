import { IStorage } from "../../../interfaces/common/runtime/i-storage";

export class StorageService {
    private _storage: IStorage;
    constructor(storage: IStorage) {
        this._storage = storage;
    }

    async get<T>(key: string): Promise<T | null> {
        return (await this._storage.get(key)) || null;
    }

    async set(key: string, value: any): Promise<void> {
        return await this._storage.set(key, value);
    }
}
