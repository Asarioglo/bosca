import { IStorage } from "../../../../core/common/runtime/i-storage";
import { AbstractState } from "../../../../core/background/src/core/plugin/abstract-state";

export type UserStateT = {
    _id?: string | null;
    id: string | null;
    providerId: string | null;
    provider: string | null;
    email: string | null;
    name: string | null;
    alias: string | null;
    appConfig: {
        debugMode: boolean;
        debugRecepient: string;
    };
};

export class UserState extends AbstractState<UserStateT> {
    private _id: string | null = null;
    private _providerId: string | null = null;
    private _provider: string | null = null;
    private _email: string | null = null;
    private _name: string | null = null;
    private _alias: string | null = null;
    // configurations
    private _debugMode: boolean = false;
    private _debugRecepient: string = "";

    constructor(storage: IStorage) {
        super("user-state", storage);
    }

    getState() {
        return {
            id: this._id,
            providerId: this._providerId,
            provider: this._provider,
            email: this._email,
            name: this._name,
            alias: this._alias,
            appConfig: {
                debugMode: this._debugMode,
                debugRecepient: this._debugRecepient,
            },
        };
    }

    async setState(state: Partial<UserStateT>) {
        if (state._id !== undefined) {
            this._id = state._id;
        }
        if (state.id !== undefined) {
            this._id = state.id;
        }
        if (state.providerId !== undefined) {
            this._providerId = state.providerId;
        }
        if (state.provider !== undefined) {
            this._provider = state.provider;
        }
        if (state.email !== undefined) {
            this._email = state.email;
        }
        if (state.name !== undefined) {
            this._name = state.name;
        }
        if (state.alias !== undefined) {
            this._alias = state.alias;
        }
        if (state.appConfig !== undefined) {
            if (state.appConfig.debugMode !== undefined) {
                this._debugMode = state.appConfig.debugMode;
            }
            if (state.appConfig.debugRecepient !== undefined) {
                this._debugRecepient = state.appConfig.debugRecepient;
            }
        }

        await this.save();
    }

    async resetState() {
        await this.setState({
            _id: null,
            id: null,
            providerId: null,
            provider: null,
            email: null,
            name: null,
            alias: null,
            appConfig: {
                debugMode: false,
                debugRecepient: "",
            },
        });
        return this;
    }
}
