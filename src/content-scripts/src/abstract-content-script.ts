import { IRuntime } from "../../common/runtime/i-runtime";

export abstract class AbstractContentScript {
    private _host: string | null = null;
    private _runtime: IRuntime;

    constructor(runtime: IRuntime, host: string | null = null) {
        this._host = host;
        this._runtime = runtime;
    }

    get runtime(): IRuntime {
        return this._runtime;
    }

    accept(windowLocation: string, context: any): boolean {
        return !!this._host && windowLocation.startsWith(this._host);
    }

    abstract launch(host: any, context?: any): void;
}
