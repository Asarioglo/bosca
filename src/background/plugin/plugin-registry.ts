import Logger from "../utils/logger";
import { IPlugin } from "../../interfaces/background/plugin/i-plugin";
import { IServiceProvider } from "../../interfaces/background/services/i-service-provider";
import { IPluginRegistry } from "../../interfaces/background/plugin/i-plugin-registry";

export class PluginRegistry implements IPluginRegistry {
    private _plugins: IPlugin[] = [];
    private _logger = new Logger("PluginRegistry");
    private _serviceRegistry: any;

    constructor(serviceRegistry: IServiceProvider) {
        this._serviceRegistry = serviceRegistry;
    }

    async registerPlugin(plugin: IPlugin) {
        this._logger.log("Registering plugin " + plugin.getName());
        await plugin.initialize(this._serviceRegistry);
        this._plugins.push(plugin);
    }

    getFullState() {
        return this._plugins.reduce((acc, plugin) => {
            return { ...acc, [plugin.getName()]: plugin.getState() };
        }, {});
    }

    getPlugins() {
        return this._plugins;
    }

    async resetState() {
        for (const plugin of this._plugins) {
            await plugin.resetState();
        }
    }
}
