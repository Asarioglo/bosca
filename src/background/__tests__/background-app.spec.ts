import { IConfig } from "../../interfaces";
import { IBrowser } from "../../interfaces/common/runtime/i-browser";
import { BackgroundApp } from "../background-app";
import createBrowser from "../../../tests/utils/mock-runtime";
import { BGCoreServices } from "../services/core-services";
import { ConfigService } from "../services/config/config-service";
import { MessagingService } from "../services/messaging/messaging-service";

describe("BackgroundApp", () => {
    let backgroundApp: BackgroundApp;
    let browser: IBrowser;
    let config: IConfig;
    let numOfBaseSubscriptions = 5;

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
            .getService(BGCoreServices.CONFIG);
        expect(configSvc).toBeDefined();
        expect((configSvc as ConfigService).get("version")).not.toBeUndefined();
        let msgService = backgroundApp
            .getServiceRegistry()
            .getService(BGCoreServices.MESSAGING);
        expect(msgService).toBeDefined();
        expect((msgService as MessagingService).hasListeners()).toBe(0);
        expect(browser.runtime.onInstalled.addListener).not.toHaveBeenCalled();

        backgroundApp.start();

        expect(browser.runtime.onInstalled.addListener).toHaveBeenCalled();
        expect((msgService as MessagingService).hasListeners()).toBe(
            numOfBaseSubscriptions,
        );
    });
});
