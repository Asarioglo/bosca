import { IService } from "../../interfaces/background/services/i-service";
import { IServiceProvider } from "../../interfaces/background/services/i-service-provider";

export class ServiceRegistry implements IServiceProvider {
    private services: Map<string, IService>;

    constructor() {
        this.services = new Map<string, IService>();
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
