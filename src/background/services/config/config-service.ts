import {
    ConfigEntry,
    IConfig,
    SupportedConfigValues,
} from "../../../interfaces/common/iconfig";
import { IConfigManager } from "../../../interfaces/background/services/i-config-manager";
import { IBrowser, IServiceProvider } from "../../../interfaces";
import {
    ConfigChangeMessage,
    ConfigChangePayload,
    CoreEvents,
} from "../../core-events";
import { BGCoreServices } from "../core-services";
import { IMessageDispatcher } from "../../../interfaces";
import { EventEmitter } from "../../../common";
import { StorageService } from "../storage/storage-service";

export class ConfigService<T = IConfig> implements IConfigManager {
    private _config = new Map<string, SupportedConfigValues>();
    private _svcRegistry: IServiceProvider | null = null;
    private _storage: StorageService | null = null;
    private _extensionId: string = "";
    private _msgService: IMessageDispatcher | null = null;
    private _pluginMessagingService: EventEmitter | null = null;

    constructor(extId: string) {
        this._extensionId = extId;
    }

    async start(browser: IBrowser, serviceProvider: IServiceProvider) {
        this._svcRegistry = serviceProvider;
        this._storage = serviceProvider.getService<StorageService>(
            BGCoreServices.STORAGE,
        );
        if (this._storage === null) {
            throw new Error(
                "Failed to start Config Service: Storage service not in service registry.",
            );
        }
        this._msgService = this._svcRegistry.getService<IMessageDispatcher>(
            BGCoreServices.MESSAGING,
        );
        if (!this._msgService) {
            throw new Error(
                "Failed to start Config Service: Messaging service not in service registry.",
            );
        }
        this._pluginMessagingService =
            this._svcRegistry.getService<EventEmitter>(
                BGCoreServices.PLUGIN_MESSAGING,
            );
        if (!this._pluginMessagingService) {
            throw new Error(
                "Failed to start Config Service: Plugin messaging service not in service registry.",
            );
        }
    }

    isReady(): boolean {
        return (
            this._svcRegistry !== null &&
            this._storage !== null &&
            this._msgService !== null &&
            this._pluginMessagingService !== null
        );
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

    private _set(
        key: string | T,
        value: SupportedConfigValues = null,
    ): ConfigChangePayload {
        const changes = {} as ConfigChangePayload;

        if (typeof key === "string") {
            this._setNormal(key, value, changes);
        } else if (typeof key === "object") {
            this._setRecursive(key as ConfigEntry, changes);
        }
        return changes;
    }

    /**
     *
     * @param key
     * @param value
     * @param noSave If true, the config will not be saved to storage.
     */
    public async set(
        key: string | T,
        value: SupportedConfigValues = null,
        noSave: boolean = false,
    ): Promise<void> {
        if (!this.isReady()) {
            throw new Error(
                "Config service has not been started, or failed to start. Cannot set config.",
            );
        }
        const changes = this._set(key, value);

        !noSave && (await this.save());

        if (this._svcRegistry && Object.keys(changes).length > 0) {
            this._msgService!.broadcastMessage({
                type: CoreEvents.CONFIG_CHANGED,
                payload: changes,
            } as ConfigChangeMessage);
            this._pluginMessagingService!.emit(
                CoreEvents.CONFIG_CHANGED,
                changes,
            );
        }
    }

    public async save() {
        if (this._storage) {
            try {
                await this._storage.set(
                    `${this._extensionId}_config`,
                    this.getFullConfig(),
                );
            } catch (e) {
                console.error("Error saving config to storage", e);
            }
        }
    }

    /**
     * Load the configuration from storage.
     * When configuration is loaded, if exists, it will be set to the current configuration,
     * and the total configuration will be saved back to the storage.
     * Designed to be called after a set and override the current configuration with stored.
     */
    public async load() {
        if (!this.isReady()) {
            throw new Error(
                "Config service has not been started, or failed to start. Cannot load config.",
            );
        }
        try {
            const config: T | null = await this._storage!.get<T>(
                `${this._extensionId}_config`,
            );
            if (config !== null) {
                await this.set(config);
            }
        } catch (e) {}
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
