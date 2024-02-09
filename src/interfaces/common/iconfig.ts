/**
 * For config service methods
 */
export type SupportedConfigValues = string | boolean | number | null;

/**
 * For config files, not for config service methods
 */
export interface ConfigEntry {
    [key: string]: SupportedConfigValues | undefined | ConfigEntry;
}

export interface IConfig extends ConfigEntry {
    version: string;
    extensionId: string;
    notifications: {
        enabled: boolean;
    };
}
