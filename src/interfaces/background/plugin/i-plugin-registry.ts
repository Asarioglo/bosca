import { IPlugin } from "./i-plugin";

export interface IPluginRegistry {
    registerPlugin(plugin: IPlugin): Promise<void>;
}
