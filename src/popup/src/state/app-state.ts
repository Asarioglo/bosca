export type ConfigObject = {
    [key: string]: string | boolean;
};

export interface ConfigState {
    debugMode: boolean;
}

export interface AppState {
    version: string;
    appName: string;
    contactEmail: string;
    website: string;
    telegram: string;
    debugMode: boolean;
}
