import { ContentScriptRegistry } from "./content-script-registry";
import { AllSitesContentScript } from "./sites/all-sites/all-sites.content";
import "../assets/styles/common.styles.css";
import "selectize/dist/css/selectize.css";
import { ChromeRuntime } from "../../common/runtime/chrome/chrome-runtime";

const currentTabUrl = window.location.href;
const runtime = ChromeRuntime;
const contentScriptRegistry = ContentScriptRegistry.getInstance();
const appName = "Bosca";
contentScriptRegistry.registerGlobalScript(
    new AllSitesContentScript(runtime, appName),
);

console.log("Launching the application");
contentScriptRegistry.launch(currentTabUrl);
