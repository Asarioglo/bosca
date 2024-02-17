import { ServiceRegistry } from "../service-registry";
import { IService } from "../../../interfaces/background/services/i-service";
import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";

class Service implements IService {
    constructor(private initialized = false) {
        // Do nothing
    }

    start = jest.fn(async () => {});

    isReady() {
        return this.initialized;
    }
}

describe("ServiceRegistry", () => {
    let serviceRegistry!: ServiceRegistry;
    let svc: Service;

    beforeEach(() => {
        serviceRegistry = new ServiceRegistry();
        svc = new Service();
    });

    afterEach(() => {
        // Clear the service registry after each test
        (serviceRegistry as any) = null;
    });

    it("should register and retrieve a service", () => {
        const serviceName = "exampleService";

        // Register the service
        serviceRegistry.registerService(serviceName, svc);

        // Retrieve the service
        const retrievedService = serviceRegistry.getService(serviceName);

        // Assert that the retrieved service is the same as the registered service
        expect(retrievedService).toBe(svc);
    });

    it("should return null for a non-existent service", () => {
        const nonExistentServiceName = "nonExistentService";

        // Retrieve a non-existent service
        const retrievedService = serviceRegistry.getService(
            nonExistentServiceName,
        );

        // Assert that the retrieved service is null
        expect(retrievedService).toBeNull();
    });

    it("should launch all ready services", async () => {
        const s1 = new Service(true);
        const s2 = new Service();
        serviceRegistry.registerService("s1", s1);
        serviceRegistry.registerService("s2", s2);
        await serviceRegistry.startServices({} as any);
        expect(s1.start).toHaveBeenCalledTimes(1);
        expect(s2.start).toHaveBeenCalledTimes(0);
    });
});
