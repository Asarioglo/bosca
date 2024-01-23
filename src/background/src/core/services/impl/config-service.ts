import { AppConfig, IConfigService } from "../i-config-service";

export class ConfigService<T extends AppConfig> implements IConfigService<T> {
    private config: T = {} as T;

    public get(key: string): any {
        return (this.config as AppConfig)[key];
    }

    public set(key: any, value?: any): void {
        if (typeof key === "string") {
            (this.config as AppConfig)[key] = value;
        } else {
            this.config = { ...this.config, ...key };
        }
    }
}
