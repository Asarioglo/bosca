export interface IConfigManager {
    get(key: string): any;
    set(key: string, value: any): void;
}
