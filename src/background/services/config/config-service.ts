import {
    ConfigEntry,
    IConfig,
    SupportedConfigValues,
} from "../../../interfaces/common/iconfig";
import { IConfigManager } from "../../../interfaces/background/services/i-config-manager";
import { IServiceProvider } from "../../../interfaces";
import {
    ConfigChangeMessage,
    ConfigChangePayload,
    CoreEvents,
} from "../../core-events";
import { BGCoreServices } from "../core-services";
import { MessagingService } from "../messaging/messaging-service";
import { PluginMessagingService } from "../messaging/plugin-messaging-service";

export class ConfigService<T = IConfig> implements IConfigManager {
    private _config = new Map<string, SupportedConfigValues>();
    private _svcRegistry: IServiceProvider;

    constructor(svcRegistry: IServiceProvider, config?: T) {
        this._svcRegistry = svcRegistry;
        if (config) this.set(config);
    }

    /**
     * Retrieve the value of a configuration key. The value will be null if the key does not exist.
     * The key represents a path to a config separated via dots. For example, "notifications.enabled".
     *
     * @param key
     * @returns
     */
    public get(key: string): any {
        return this._config.get(key) || null;
    }

    /**
     *
     * @param key
     * @param value
     */
    public set(
        key: string | object,
        value: SupportedConfigValues = null,
    ): void {
        const changes = {} as ConfigChangePayload;

        if (typeof key === "string") {
            this._setNormal(key, value, changes);
        } else if (typeof key === "object") {
            this._setRecursive(key as ConfigEntry, changes);
        }
        if (this._svcRegistry && Object.keys(changes).length > 0) {
            this._svcRegistry
                .getService<MessagingService>(BGCoreServices.MESSAGING)
                ?.broadcastMessage({
                    type: CoreEvents.CONFIG_CHANGED,
                    payload: changes,
                } as ConfigChangeMessage);
            this._svcRegistry
                .getService<PluginMessagingService>(
                    BGCoreServices.PLUGIN_MESSAGING,
                )
                ?.emit(CoreEvents.CONFIG_CHANGED, changes);
        }
    }

    private _setNormal(
        key: string,
        value: SupportedConfigValues,
        changed: ConfigChangePayload,
    ): void {
        const oldValue = this._config.get(key);
        if (oldValue !== value) {
            this._config.set(key, value);
            changed[key] = {
                oldValue: oldValue || null,
                newValue: value,
            };
        }
    }

    public _setRecursive(
        value: ConfigEntry,
        changed: Record<string, any>,
        prefix: string = "",
    ): void {
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                const val = value[key];
                if (typeof val === "object") {
                    this._setRecursive(val as ConfigEntry, changed, fullKey);
                } else {
                    this._setNormal(
                        fullKey,
                        val as SupportedConfigValues,
                        changed,
                    );
                }
            }
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
