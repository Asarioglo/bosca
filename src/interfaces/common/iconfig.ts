export interface ConfigEntry {
    [key: string]: string | boolean | number | undefined | ConfigEntry;
}

export interface IConfig extends ConfigEntry {
    version: string;
}
