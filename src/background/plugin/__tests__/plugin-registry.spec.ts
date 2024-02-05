import { PluginRegistry } from "../plugin-registry";
import { IPlugin } from "../../../interfaces/background/plugin/i-plugin";
import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";
import { IBrowser } from "../../../interfaces/common/runtime/i-browser";
import getMockBrowser from "../../../../tests/utils/mock-runtime";

describe("PluginRegistry", () => {
    let pluginRegistry: PluginRegistry;
    let serviceRegistry: IServiceProvider;
    let mockPlugin: IPlugin;
    let mockBrowser: IBrowser;

    beforeEach(() => {
        serviceRegistry = {} as IServiceProvider;
        pluginRegistry = new PluginRegistry();
        mockPlugin = {
            getName: jest.fn(),
            getVersion: jest.fn(),
            start: jest.fn(),
            destroy: jest.fn(),
            activate: jest.fn(),
            deactivate: jest.fn(),
            getState: jest.fn(),
            resetState: jest.fn(),
        } as IPlugin;
        mockBrowser = getMockBrowser();
    });

    it("should register a plugin", async () => {
        await pluginRegistry.registerPlugin(mockPlugin);

        const plugins = pluginRegistry.getPlugins();
        expect(plugins).toContain(mockPlugin);
        expect(mockPlugin.start).not.toHaveBeenCalled();
    });

    it("should start all plugins", async () => {
        await pluginRegistry.registerPlugin(mockPlugin);
        await pluginRegistry.launch(mockBrowser, serviceRegistry);
        expect(mockPlugin.start).toHaveBeenCalledWith(
            mockBrowser,
            serviceRegistry,
        );
    });

    it("should reset the state", async () => {
        await pluginRegistry.registerPlugin(mockPlugin);
        await pluginRegistry.resetState();

        expect(mockPlugin.resetState).toHaveBeenCalled();
    });

    // Add more tests as needed
});
