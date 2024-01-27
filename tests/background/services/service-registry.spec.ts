import { ServiceRegistry } from "../../../src/background/services/service-registry";
import { IService } from "../../../src/interfaces/background/services/i-service";
import { IServiceProvider } from "../../../src/interfaces/background/services/i-service-provider";

class Service implements IService {
    constructor(serviceProvider: IServiceProvider) {
        // Do nothing
    }
}

describe("ServiceRegistry", () => {
    let serviceRegistry!: ServiceRegistry;
    let svc: Service;

    beforeEach(() => {
        (ServiceRegistry as any).instance = null;
        serviceRegistry = ServiceRegistry.getInstance();
        svc = new Service(serviceRegistry);
    });

    afterEach(() => {
        // Clear the service registry after each test
        (serviceRegistry as any) = null;
    });

    it("should test singleton behaviour", () => {
        const serviceRegistry2 = ServiceRegistry.getInstance();
        expect(serviceRegistry).toBe(serviceRegistry2);
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
});
