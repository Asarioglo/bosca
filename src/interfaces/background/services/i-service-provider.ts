import { IService } from "./i-service";

export interface IServiceProvider {
    getService(name: string): IService | null;
    registerService(name: string, service: IService): void;
}
