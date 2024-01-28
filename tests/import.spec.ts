import app from "../src";
import getMockBrowser from "./common/mock-runtime";

describe("app", () => {
    beforeAll(() => {
        // define a global chrome object
        global.chrome = global.chrome || getMockBrowser();
    });

    it("should export app", () => {
        expect(app).toBeDefined();
        expect(app.Background).toBeDefined();
        expect(app.Common).toBeDefined();
        expect(app.ContentScripts).toBeDefined();
    });
});
