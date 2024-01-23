export type CombinedState = Record<string, any>;

export class Context {
    private _stateChanged: boolean = false;
    private _responseObject: any | null = null;
    private _state: CombinedState = {};

    stateChanged() {
        this._stateChanged = true;
    }

    getStateChanged() {
        return this._stateChanged;
    }

    addResponseData(key: string, value: any) {
        if (!this._responseObject) {
            this._responseObject = {};
        }
        this._responseObject[key] = value;
    }

    getResponseData() {
        return this._responseObject;
    }

    addStateData(key: string, value: any) {
        this._state[key] = value;
    }

    getState() {
        return this._state;
    }
}
