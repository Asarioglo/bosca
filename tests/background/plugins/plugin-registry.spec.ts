import { PluginRegistry } from "../../../src/background/plugin/plugin-registry";
import { IPlugin } from "../../../src/interfaces/background/plugin/i-plugin";
import { IServiceProvider } from "../../../src/interfaces/background/services/i-service-provider";

describe("PluginRegistry", () => {
    let pluginRegistry: PluginRegistry;
    let serviceRegistry: IServiceProvider;
    let mockPlugin: IPlugin;

    beforeEach(() => {
        serviceRegistry = {} as IServiceProvider;
        pluginRegistry = new PluginRegistry(serviceRegistry);
        mockPlugin = {
            getName: jest.fn(),
            initialize: jest.fn(),
            getVersion: jest.fn(),
            destroy: jest.fn(),
            activate: jest.fn(),
            deactivate: jest.fn(),
            getState: jest.fn(),
            resetState: jest.fn(),
        } as IPlugin;
    });

    it("should register a plugin", async () => {
        await pluginRegistry.registerPlugin(mockPlugin);

        const plugins = pluginRegistry.getPlugins();
        expect(plugins).toContain(mockPlugin);
        expect(mockPlugin.initialize).toHaveBeenCalledWith(serviceRegistry);
    });

    it("should reset the state", async () => {
        await pluginRegistry.registerPlugin(mockPlugin);
        await pluginRegistry.resetState();

        expect(mockPlugin.resetState).toHaveBeenCalled();
    });

    // Add more tests as needed
});
