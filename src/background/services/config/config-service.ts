import { IConfig } from "../../../interfaces/common/iconfig";
import { IConfigManager } from "../../../interfaces/background/services/i-config-manager";
import { IServiceProvider } from "../../../interfaces";
import { ConfigChangeMessage, ConfigChangePayload, CoreEvents } from "../../core-events";
import { BGCoreServices } from "../core-services";
import { MessagingService } from "../messaging/messaging-service";
import { PluginMessagingService } from "../messaging/plugin-messaging-service";

export class ConfigService<T = IConfig> implements IConfigManager {
    private _config = new Map<string, any>();
    private _svcRegistry: IServiceProvider;

    constructor(svcRegistry: IServiceProvider, config?: T) {
        this._svcRegistry = svcRegistry;
        if (config) this.set(config);
    }

    public get(key: string): any {
        return this._config.get(key) || null;
    }

    public set(key: string | object, value?: any): void {
        const changes = {} as ConfigChangePayload;
        if (typeof key === "string") {
            if(this._config.get(key) !== value) {
                changes[key] = { oldValue: this._config.get(key) || null, newValue: value };
                this._config.set(key, value);
            }
        } else if (typeof key === "object") {
            for (const [k, v] of Object.entries(key)) {
                if(this._config.get(k) !== v) {
                    changes[k] = { oldValue: this._config.get(k) || null, newValue: v };
                    this._config.set(k, v);
                }
            }
        }
        if (this._svcRegistry) {
            (this._svcRegistry.getService<MessagingService>(BGCoreServices.MESSAGING))?.broadcastMessage({
                type: CoreEvents.CONFIG_CHANGED,
                payload: changes,
            } as ConfigChangeMessage);
            (this._svcRegistry.getService<PluginMessagingService>(BGCoreServices.PLUGIN_MESSAGING))?.emit(
                CoreEvents.CONFIG_CHANGED,
                changes,
            );
        }
    }

    public getFullConfig(): IConfig {
        const config: any = {};
        this._config.forEach((value, key) => {
            config[key] = value;
        });
        return config;
    }
}
