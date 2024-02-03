import { IBrowser } from "../../common/runtime/i-browser";
import { IServiceProvider } from "../services/i-service-provider";
import { IPlugin } from "./i-plugin";

export interface IPluginRegistry {
    registerPlugin(plugin: IPlugin): Promise<void>;
    launch(browser: IBrowser, svcProvider: IServiceProvider): Promise<void>;
    getFullState(): { [key: string]: any };
}
