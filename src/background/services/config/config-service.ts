import { IConfig } from "../../../interfaces/common/iconfig";
import { IConfigManager } from "../../../interfaces/background/services/i-config-manager";

export class ConfigService<T = IConfig> implements IConfigManager {
    private config = new Map<string, any>();

    constructor(config?: T) {
        if (config) this.set(config);
    }

    public get(key: string): any {
        return this.config.get(key) || null;
    }

    public set(key: string | object, value?: any): void {
        if (typeof key === "string") {
            this.config.set(key, value);
        } else if (typeof key === "object") {
            for (const [k, v] of Object.entries(key)) {
                this.config.set(k, v);
            }
        }
    }

    public getFullConfig(): IConfig {
        const config: any = {};
        this.config.forEach((value, key) => {
            config[key] = value;
        });
        return config;
    }
}
