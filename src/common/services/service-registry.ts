import { IBrowser } from "../../interfaces";
import { IService } from "../../interfaces/background/services/i-service";
import { IServiceProvider } from "../../interfaces/background/services/i-service-provider";
import Logger from "../utils/logger";

export class ServiceRegistry implements IServiceProvider {
    private services: Map<string, IService>;
    private _logger = Logger.getLogger("ServiceRegistry");

    constructor() {
        this.services = new Map<string, IService>();
    }

    public async startServices(browser: IBrowser): Promise<void> {
        const all: Promise<any>[] = [];
        const names: string[] = [];
        for (let [name, service] of this.services) {
            if (service.isReady()) {
                all.push(service.start(browser, this));
                names.push(name);
            }
        }
        await Promise.all(all);
        this._logger.log(`Started services: ${names.join(", ")}`);
    }

    public getServiceNames(): string[] {
        return Array.from(this.services.keys());
    }

    public registerService(name: string, service: IService): void {
        this.services.set(name, service);
    }

    public getService<T = IService>(name: string): T | null {
        let svc = this.services.get(name);
        if (svc) {
            return svc as T;
        }
        return null;
    }

    public deleteService(name: string): void {
        this.services.delete(name);
    }
}
