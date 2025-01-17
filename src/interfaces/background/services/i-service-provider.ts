import { IService } from "./i-service";

export interface IServiceProvider {
    getService<T = IService>(name: string): T | null;
    registerService(name: string, service: IService): void;
    deleteService(name: string): void;
}
