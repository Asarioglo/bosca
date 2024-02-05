import Logger from "../../common/utils/logger";
import { IPlugin } from "../../interfaces/background/plugin/i-plugin";
import { IServiceProvider } from "../../interfaces/background/services/i-service-provider";
import { IPluginRegistry } from "../../interfaces/background/plugin/i-plugin-registry";
import { IBrowser } from "../../interfaces/common/runtime/i-browser";

export class PluginRegistry implements IPluginRegistry {
    private _plugins: IPlugin[] = [];
    private _logger = new Logger("PluginRegistry");

    constructor() {}

    async launch(
        browser: IBrowser,
        svcRegistry: IServiceProvider,
    ): Promise<void> {
        for (const plugin of this._plugins) {
            await plugin.start(browser, svcRegistry);
        }
    }

    async registerPlugin(plugin: IPlugin) {
        this._logger.log("Registering plugin " + plugin.getName());
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
