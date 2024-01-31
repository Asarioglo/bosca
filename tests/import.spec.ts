import {Background, Common, ContentScripts, Interfaces} from "../src";
import getMockBrowser from "./common/mock-runtime";

describe("app", () => {
    let chrome = getMockBrowser();
    beforeAll(() => {
        // define a global chrome object
        chrome = getMockBrowser();
        global.chrome = global.chrome || chrome;
    });
``
    it("should export app", () => {
        expect(Background).toBeDefined();
        expect(Common).toBeDefined();
        expect(ContentScripts).toBeDefined();
        expect(Interfaces).toBeDefined();
    });

    it("should run an application", () => {
        const app = new Background.BackgroundApp(chrome, {});
        const contentApp = new ContentScripts.ContentApp(chrome, "test");
    });
});
