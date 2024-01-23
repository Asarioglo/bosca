import bundlePlugins from "./bundler";
import MainConfig from "../main-config.json";
import Logger from "./src/core/utils/logger";
import BoscaConfig from "./src/bosca/config/config";
import { MainWorker } from "./src/main-worker";

const logger = new Logger("Background");
logger.log("Executing entrypoint script");

const worker = new MainWorker<BoscaConfig>(MainConfig as BoscaConfig);
logger.log("worker initialized, adding plugins");
const pluginRegistry = worker.getPluginRegistry();

bundlePlugins(pluginRegistry).then(() => {
    worker.start();
});
