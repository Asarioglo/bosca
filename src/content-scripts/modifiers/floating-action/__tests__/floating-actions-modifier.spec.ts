/**
 * @jest-environment jsdom
 */

import { ActionClassNames } from "../action";
import {
    AnchorType,
    ElementIDPrefix,
    FloatingActionsModifier,
} from "../floating-actions-modifier";

describe("FloatingActionsModifier", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("should create instance", () => {
        const modifier = new FloatingActionsModifier("my-modifier");
        expect(modifier).toBeDefined();
    });

    it("should create the main, buttons, and not icon containers", () => {
        const modifier = new FloatingActionsModifier("my-modifier");
        modifier.apply();
        const container = document.querySelector(
            `[id*="${ElementIDPrefix.CONTAINER}"]`,
        );
        expect(container).toBeDefined();
        const buttonsContainer = document.querySelector(
            `[id*="${ElementIDPrefix.BUTTONS_CONTAINER}"]`,
        );
        expect(buttonsContainer).toBeDefined();
        const iconContainer = document.querySelector(
            `[id*="${ElementIDPrefix.ICON_CONTAINER}"]`,
        );
        expect(iconContainer).toBeNull();
    });

    it("should remove entirely from the DOM", () => {
        const modifier = new FloatingActionsModifier("my-modifier");
        modifier.apply();
        modifier.remove();
        const container = document.querySelector(
            `[id*="${ElementIDPrefix.CONTAINER}"]`,
        );
        expect(container).toBeNull();
    });

    it("should add an action", () => {
        const modifier = new FloatingActionsModifier("my-modifier");
        const actionCb = jest.fn();
        const action = modifier.addAction("test", actionCb);
        expect(action).toBeDefined();
        expect(action.getElement()).toBeDefined();
        let actionBtn = document.querySelector(
            `[className*="${ActionClassNames.BTN}"]`,
        );
        expect(actionBtn).toBeNull();
        modifier.apply();
        action.getElement().click();
        expect(actionCb).toHaveBeenCalledTimes(1);
        actionBtn = document.querySelector(
            `[className*="${ActionClassNames.BTN}"]`,
        );
        expect(actionBtn).toBeDefined();
    });

    it("should calculate position based on anchor", () => {
        const modifier = new FloatingActionsModifier("my-modifier");
        modifier.setAnchor(AnchorType.TOP_LEFT);
        modifier.addAction("test", jest.fn());
        modifier.apply();

        modifier.setPosition(500, 500);
        const container = modifier.getContainer() as HTMLDivElement;
        (container as any).height = 100;
        (container as any).width = 100;
        expect(container).toBeDefined();
        expect(container.style.left).toBe("500px");
        expect(container.style.top).toBe("500px");
    });
});
