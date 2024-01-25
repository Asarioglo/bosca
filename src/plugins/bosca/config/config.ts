import {
    AppConfig,
    IConfigService,
} from "../../../core/background/src/core/services/i-config-service";

export type Config = AppConfig & {
    appName: string;
    version: string;
    contactEmail: string;
    website: string;
    telegram: string;
    debugMode?: boolean;
};

export default Config;

export type BoscaConfigService = IConfigService<Config>;
