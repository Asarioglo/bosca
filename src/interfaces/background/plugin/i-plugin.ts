import { IBrowser } from "../../common/runtime/i-browser";
import { IServiceProvider } from "../services/i-service-provider";

export interface IPlugin {
    getName(): string;
    getVersion(): string;
    start(browser: IBrowser, serviceProvider: IServiceProvider): Promise<void>;
    destroy(): Promise<void>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
    getState(): any;
    resetState(): Promise<void>;
}
