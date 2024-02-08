import { IModifier } from "../../../interfaces";
import { Action } from "./action";
import "../../assets/styles/actions.styles.css";

export enum AnchorType {
    TOP_LEFT = "top-left",
    TOP_RIGHT = "top-right",
    BOTTOM_LEFT = "bottom-left",
    BOTTOM_RIGHT = "bottom-right",
}

export class Point {
    constructor(
        public x: number,
        public y: number,
    ) {}
}

export enum ElementIDPrefix {
    CONTAINER = "bosca-actions-container",
    ICON_CONTAINER = "bosca-actions-icon-container",
    BUTTONS_CONTAINER = "bosca-actions-buttons-container",
    ICON = "bosca-actions-icon",
}

export type BoundingBox = {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
};

/**
 * Appends a floating container to the parent element (defaults to document.body) and allows
 * adding actions to it. The container can be positioned and anchored within the parent element.
 * Actions are buttons that can be added to the container and are styled as floating action buttons.
 *
 * @param id The unique identifier for the floating actions container (will be used in element IDs)
 * @param icon Optional icon to be displayed on the container
 * @param parent The parent element to which the container will be appended (defaults to document.body)
 * Note that the parent element should have a position of relative or absolute. If that's not the case, this
 * class will modify the parent element's position to relative.
 */
export class FloatingActionsModifier implements IModifier {
    private _container?: HTMLDivElement;
    private _iconContainer?: HTMLDivElement;
    private _buttonsContainer?: HTMLDivElement;
    private _anchor: AnchorType = AnchorType.TOP_LEFT;
    private _actions: Action[] = [];
    private _position: Point = new Point(0, 0);
    private _iconPosition: "left" | "right" = "left";
    private _debugContainer?: HTMLDivElement;

    constructor(
        public id: string,
        public icon?: string,
        private _parent: HTMLElement = document.body,
    ) {}

    /**
     * If actions already initialized, shows them. Otherwise, creates the container and appends it to the parent.
     */
    apply() {
        if (!this._container) {
            this._container = this._createMainContainer();
            this._buttonsContainer = this._createButtonsContainer();
            this._actions.forEach((action) => {
                this._buttonsContainer?.appendChild(action.getElement());
            });
            this._container.appendChild(this._buttonsContainer);
            if (this.icon) {
                this._iconContainer = this._createIconContainer();
                const icon = this._createIcon();
                this._iconContainer.appendChild(icon);
                if (this._iconPosition === "left") {
                    this._container.insertBefore(
                        this._iconContainer,
                        this._buttonsContainer,
                    );
                } else {
                    this._container.appendChild(this._iconContainer);
                }
            }
        }
    }

    public hide() {
        if (this._container && !this._isHiddenOrNotInitialized()) {
            this._container.classList.add("hidden");
        }
    }

    public show(x?: number, y?: number) {
        if (x && y) {
            this.setPosition(x, y);
        }
        if (this._container && this._isHiddenOrNotInitialized()) {
            this._container.classList.remove("hidden");
        }
    }

    public hideAllActions() {
        this._actions.forEach((action) => {
            action.hide();
        });
    }

    public showAllActions() {
        this._actions.forEach((action) => {
            action.show();
        });
    }

    public remove() {
        if (this._container) {
            for (let action of this._actions) {
                action.remove();
            }
            this._container.remove();
            this._container = undefined;
        }
    }

    public getContainer() {
        return this._container;
    }

    public setPosition(x: number | BoundingBox, y: number) {
        if (typeof x === "number") {
            this._position = new Point(x, y);
        } else {
            this._position = new Point(x.left, x.top);
        }
        this._calculatePosition();
    }

    /**
     * Sets the position of the floating actions container based on the given rect and anchor type.
     * It is assumed that the rect is defined withn the viewport coordinates and not the document coordinates.
     * Scroll offsets will be added as a part of the calculation.
     */
    public setPositionFromRect(rect: BoundingBox, rect_anchor: AnchorType) {
        if (rect_anchor === AnchorType.TOP_LEFT) {
            this._position = new Point(rect.left, rect.top);
        } else if (rect_anchor === AnchorType.TOP_RIGHT) {
            this._position = new Point(rect.right, rect.top);
        } else if (rect_anchor === AnchorType.BOTTOM_LEFT) {
            this._position = new Point(rect.left, rect.bottom);
        } else if (rect_anchor === AnchorType.BOTTOM_RIGHT) {
            this._position = new Point(rect.right, rect.bottom);
        }

        this._calculatePosition();
    }

    public setAnchor(anchor: AnchorType) {
        this._anchor = anchor;
        this._calculatePosition();
    }

    public addAction(
        label: string,
        action: () => void,
        tooltip?: string,
        icon?: string,
    ): Action {
        const actionBtn = new Action(label, action, icon, tooltip);
        this._actions.push(actionBtn);
        this._container?.appendChild(actionBtn.getElement());
        return actionBtn;
    }

    public enableDebug() {
        this._debugContainer = document.createElement("div");
        this._debugContainer.style.position = "fixed";
        this._debugContainer.style.border = "1px solid red";
        this._debugContainer.style.zIndex = "9999";
        this._debugContainer.style.pointerEvents = "none";
        document.body.appendChild(this._debugContainer);
    }

    public disableDebug() {
        this._debugContainer?.remove();
        this._debugContainer = undefined;
    }

    public hideDebug() {
        if (this._debugContainer) {
            this._debugContainer.style.display = "none";
        }
    }

    public setDebugPosition(position: BoundingBox) {
        if (this._debugContainer) {
            this._debugContainer.style.left = `${position.left}px`;
            this._debugContainer.style.top = `${position.top}px`;
            this._debugContainer.style.width = `${position.width}px`;
            this._debugContainer.style.height = `${position.height}px`;
            this._debugContainer.style.display = "block";
        } else {
            console.log("Bosca: Debug container not enabled");
        }
    }

    private _isHiddenOrNotInitialized() {
        if (!this._container) return true;
        return this._container.classList.contains("hidden");
    }

    private _show() {
        if (this._container && this._isHiddenOrNotInitialized()) {
            this._container.classList.remove("hidden");
        }
    }

    private _createMainContainer() {
        const container = document.createElement("div");
        container.id = `${ElementIDPrefix.CONTAINER}-${this.id}`;
        const parentPosition = this._parent.style.position;
        if (parentPosition !== "absolute" && parentPosition !== "relative") {
            this._parent.style.position = "relative";
        }
        this._parent.appendChild(container);
        return container;
    }

    private _createIconContainer() {
        const container = document.createElement("div");
        container.id = `${ElementIDPrefix.ICON_CONTAINER}-${this.id}`;
        return container;
    }

    private _createIcon() {
        const icon = document.createElement("img");
        icon.src = this.icon || "";
        icon.id = `${ElementIDPrefix.ICON}-${this.id}`;
        return icon;
    }

    private _createButtonsContainer() {
        const container = document.createElement("div");
        container.id = `${ElementIDPrefix.BUTTONS_CONTAINER}-${this.id}`;
        return container;
    }

    private _calculatePosition() {
        if (!this._container) return;

        const { x, y } = this._position;

        const width = this._container.offsetWidth;
        const height = this._container.offsetHeight;

        const parentViewportRect = this._parent.getBoundingClientRect();

        let newX = x - parentViewportRect.left;
        let newY = y - parentViewportRect.top;

        switch (this._anchor) {
            case AnchorType.TOP_LEFT:
                break;
            case AnchorType.TOP_RIGHT:
                newX = newX - width;
                break;
            case AnchorType.BOTTOM_LEFT:
                newY = newY - height;
                break;
            case AnchorType.BOTTOM_RIGHT:
                newX = newX - width;
                newY = newY - height;
                break;
        }
        console.log(`New X: ${newX}, New Y: ${newY}`);
        this._container.style.left = `${newX}px`;
        this._container.style.top = `${newY}px`;
    }
}
