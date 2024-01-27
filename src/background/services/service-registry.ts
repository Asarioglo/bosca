import { IService } from "../../interfaces/background/services/i-service";
import { IServiceProvider } from "../../interfaces/background/services/i-service-provider";

export class ServiceRegistry implements IServiceProvider {
    private static instance: ServiceRegistry;
    private services: Map<string, IService>;

    constructor() {
        this.services = new Map<string, IService>();
    }

    public static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    public registerService(name: string, service: IService): void {
        this.services.set(name, service);
    }

    public getService(name: string): IService | null {
        return this.services.get(name) || null;
    }
}

const serviceRegistry = ServiceRegistry.getInstance();
export default serviceRegistry;
