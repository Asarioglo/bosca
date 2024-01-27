import { IServiceProvider } from "./i-service-provider";

export interface IService {}

declare var IService: {
    new (svcProvider: IServiceProvider): IService;
};
