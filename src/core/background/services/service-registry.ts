interface IService {
    // Define the methods and properties of your service here
}

class ServiceRegistry {
    private static instance: ServiceRegistry;
    private services: Map<string, IService>;

    private constructor() {
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

    public getService(name: string): IService | undefined {
        return this.services.get(name);
    }
}

const serviceRegistry = ServiceRegistry.getInstance();
export default serviceRegistry;
