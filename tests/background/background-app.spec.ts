import { IConfig } from "../../src/interfaces/background/iconfig";
import { IBrowser } from "../../src/interfaces/common/runtime/i-browser";
import { BackgroundApp } from "../../src/background/background-app";
import createBrowser from "../common/mock-runtime";
import { CoreServices } from "../../src/background/services/core-services";
import { ConfigService } from "../../src/background/services/config/config-service";
import { MessagingService } from "../../src/background/services/messaging/messaging-service";

describe("BackgroundApp", () => {
    let backgroundApp: BackgroundApp;
    let browser: IBrowser;
    let config: IConfig;

    beforeEach(() => {
        browser = createBrowser();
        config = {} as IConfig;
        backgroundApp = new BackgroundApp(browser, config);
    });

    it("should wait until start() to initialize", () => {
        jest.spyOn(browser.runtime.onInstalled, "addListener");
        expect(
            backgroundApp.getServiceRegistry().getServiceNames().length,
        ).toBeGreaterThan(0);
        let configSvc = backgroundApp
            .getServiceRegistry()
            .getService(CoreServices.CONFIG);
        expect(configSvc).toBeDefined();
        expect((configSvc as ConfigService).get("version")).not.toBeUndefined();
        let msgService = backgroundApp
            .getServiceRegistry()
            .getService(CoreServices.MESSAGING);
        expect(msgService).toBeDefined();
        expect((msgService as MessagingService).hasListeners()).toBe(0);
        expect(browser.runtime.onInstalled.addListener).not.toHaveBeenCalled();

        backgroundApp.start();

        expect(browser.runtime.onInstalled.addListener).toHaveBeenCalled();
        expect((msgService as MessagingService).hasListeners()).toBe(2);
    });
});