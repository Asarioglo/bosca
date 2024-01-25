import { IStorage } from "../../../interfaces/common/runtime/i-storage";

export class StorageService {
    private _storage: IStorage;
    constructor(storage: IStorage) {
        this._storage = storage;
    }

    async get<T>(key: string): Promise<T | null> {
        return this._storage.get(key);
    }

    async set(key: string, value: any): Promise<void> {
        return this._storage.set(key, value);
    }
}
