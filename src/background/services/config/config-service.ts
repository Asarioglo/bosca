import { IConfig } from "../../../interfaces/background/iconfig";
import { IConfigManager } from "../../../interfaces/background/services/i-config-manager";

export class ConfigService implements IConfigManager {
    private config = new Map<string, any>();

    constructor(config?: IConfig) {
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
}
