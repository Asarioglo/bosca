import { IBrowser } from "../../common/runtime/i-browser";
import { IConfig } from "../iconfig";
import { IServiceProvider } from "../services/i-service-provider";

export interface IPlugin {
    name: string;
    initialize(
        browser: IBrowser,
        svcProvider?: IServiceProvider,
    ): Promise<void>;
    destroy(): Promise<void>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
}
