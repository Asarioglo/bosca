/**
 * @jest-environment jsdom
 */

import { Background, Common, ContentScripts, Interfaces } from "../src";
import getMockBrowser from "./utils/mock-runtime";

describe("app", () => {
    let chrome = getMockBrowser();
    beforeAll(() => {
        // define a global chrome object
        chrome = getMockBrowser();
        global.chrome = global.chrome || chrome;
    });
    ``;
    it("should export app", () => {
        expect(Background).toBeDefined();
        expect(Common).toBeDefined();
        expect(ContentScripts).toBeDefined();
        expect(Interfaces).toBeDefined();
    });

    it("should run an application", async () => {
        const app = new Background.BackgroundApp(chrome);
        await app.start({} as any);
        const contentApp = new ContentScripts.ContentApp(chrome, "test");
    });
});
