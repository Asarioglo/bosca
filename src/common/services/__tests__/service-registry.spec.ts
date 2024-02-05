import { ServiceRegistry } from "../service-registry";
import { IService } from "../../../interfaces/background/services/i-service";
import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";

class Service implements IService {
    constructor(serviceProvider: IServiceProvider) {
        // Do nothing
    }
}

describe("ServiceRegistry", () => {
    let serviceRegistry!: ServiceRegistry;
    let svc: Service;

    beforeEach(() => {
        serviceRegistry = new ServiceRegistry();
        svc = new Service(serviceRegistry);
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
});
