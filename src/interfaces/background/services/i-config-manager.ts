import { IService } from "./i-service";

export interface IConfigManager extends IService {
    get(key: string): any;
    set(key: string, value: any): void;
    getFullConfig(): { [key: string]: any };
}
