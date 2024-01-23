import { IStorage } from "../../../../common/runtime/i-storage";
import Logger from "../utils/logger";

export abstract class AbstractState<T> {
    private _logger: Logger;
    private _storage: IStorage;
    stateId: string;
    constructor(id: string, storage: IStorage) {
        this.stateId = id;
        this._logger = new Logger(id);
        this._storage = storage;
    }

    abstract getState(options?: any): T;

    abstract setState(state: T): Promise<void>;

    abstract resetState(): Promise<any>;

    async save() {
        if (!this.stateId) {
            throw new Error("State ID not set");
        }
        const state = this.getState();
        await this._storage.set(this.stateId, state);
    }

    async load() {
        if (!this.stateId) {
            throw new Error("State ID not set");
        }
        const state = await this._storage.get(this.stateId);
        if (state) {
            this._logger.log(`State loaded for ${this.stateId}`);
            this._logger.log(JSON.stringify(state[this.stateId], null, 2));
            this.setState(state);
        }
    }
}
