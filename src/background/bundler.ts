import { PluginRegistry } from "./src/core/plugin/plugin-registry";
// import { AnalyticsPlugin } from "./src/bosca/plugins/analytics/analytics-plugin";
// import { AuthPlugin } from "./src/bosca/plugins/auth/auth-plugin";
// import { HelpPlugin } from "./src/bosca/plugins/help/help-plugin";
// import { UserPlugin } from "./src/bosca/plugins/user/user-plugin";

const bundlePlugins = async (pluginRegistry: PluginRegistry) => {
    // Backend Dependent plugins, make sure you configure the Backend URL
    // in the src/background/config.json file
    // const analytics = new AnalyticsPlugin();
    // const auth = new AuthPlugin();
    // const user = new UserPlugin();
    // const help = new HelpPlugin();
    // await pluginRegistry.registerPlugin(analytics);
    // await pluginRegistry.registerPlugin(auth);
    // await pluginRegistry.registerPlugin(user);
    // await pluginRegistry.registerPlugin(help);
};

export default bundlePlugins;
