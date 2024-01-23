import { IStorage } from "../../../../../common/runtime/i-storage";
import { AbstractState } from "../../../core/plugin/abstract-state";

export type AuthStateT = {
    token: string | null;
    authenticated: boolean;
};

export class AuthState extends AbstractState<AuthStateT> {
    private _token: string | null = null;
    private _authenticated: boolean = false;

    constructor(storage: IStorage) {
        super("auth-state", storage);
    }

    getState() {
        return {
            authenticated: this._authenticated,
            token: this._token,
        };
    }

    async setState(state: Partial<AuthStateT>) {
        if (state.token !== undefined) {
            this._token = state.token;
        }
        if (typeof state.authenticated === "boolean") {
            this._authenticated = state.authenticated;
        }

        await this.save();
    }

    async resetState() {
        await this.setState({ token: null, authenticated: false });
        return this;
    }
}
