/**
 * @jest-environment jsdom
 */
import { OverlayClasses, OverlayModifier } from "../overlay-modifier";

describe("FloatingActionsModifier", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("should create instance", () => {
        const modifier = new OverlayModifier();
        expect(modifier).toBeDefined();
    });

    it("should add a overlay", () => {
        const modifier = new OverlayModifier();
        modifier.apply();
        const overlay = document.querySelector(`.${OverlayClasses.CONTAINER}`);
        expect(overlay).toBeDefined();
    });

    it("should remove overlay", () => {
        const modifier = new OverlayModifier();
        modifier.apply();
        modifier.remove();
        const overlay = document.querySelector(`.${OverlayClasses.CONTAINER}`);
        expect(overlay).toBeNull();
    });
});
