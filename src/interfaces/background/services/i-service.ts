import { IBrowser } from "../../common";
import { IServiceProvider } from "./i-service-provider";

export interface IService {
    start(browser: IBrowser, serviceProvider: IServiceProvider): Promise<void>;
    isReady(): boolean;
}

declare var IService: {
    new (svcProvider: IServiceProvider): IService;
};
