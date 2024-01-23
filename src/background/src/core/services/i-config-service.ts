export type AppConfig = Record<string, string | number>;

export interface IConfigService<T extends AppConfig> {
    get(key: string): any;
    set(key: string | Partial<T>, value: any): void;
}
