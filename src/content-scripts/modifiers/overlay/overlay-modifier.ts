import { IModifier } from "../../../interfaces";
import "./overlay.styles.css";

export enum OverlayClasses {
    CONTAINER = "bosca-overlay",
    HIDDEN = "bosca-overlay-hidden",
    PASS_THROUGH = "div-pass-through",
}

export class OverlayModifier implements IModifier {
    private _overlay?: HTMLElement;
    private _passThrough: boolean = false;
    constructor(public parent: HTMLElement = document.body) {}

    getElement(): HTMLElement | null {
        return this._overlay || null;
    }

    /**
     * Apply the modifier to the page.
     */
    apply() {
        if (this._overlay) {
            this._overlay.classList.remove(OverlayClasses.HIDDEN);
        } else {
            const overlay = document.createElement("div");
            overlay.className = OverlayClasses.CONTAINER;
            if (this._passThrough) {
                overlay.classList.add(OverlayClasses.PASS_THROUGH);
            }
            this.parent.appendChild(overlay);
            this._overlay = overlay;
        }
    }
    /**
     * Hide the modifications, but don't remove the elements from the page.
     */
    hide() {
        if (this._overlay) {
            this._overlay.classList.add(OverlayClasses.HIDDEN);
        }
    }
    /**
     * Remove the modifications from the page.
     */
    remove() {
        if (this._overlay) {
            this._overlay.remove();
            this._overlay = undefined;
        }
    }

    setPassThrough(passThrough: boolean) {
        this._passThrough = passThrough;
        if (this._overlay) {
            if (
                this._passThrough &&
                !this._overlay.classList.contains(OverlayClasses.PASS_THROUGH)
            ) {
                this._overlay.classList.add(OverlayClasses.PASS_THROUGH);
            }
            if (
                !this._passThrough &&
                this._overlay.classList.contains(OverlayClasses.PASS_THROUGH)
            ) {
                this._overlay.classList.remove(OverlayClasses.PASS_THROUGH);
            }
        }
        return this;
    }
}
