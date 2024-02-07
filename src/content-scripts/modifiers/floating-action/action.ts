export enum ActionClassNames {
    BTN = "floating-action-button",
}

export class Action {
    private _btnElement: HTMLButtonElement;
    constructor(
        public label: string,
        public action: () => void,
        public icon?: string,
        public tooltip?: string,
    ) {
        this._btnElement = document.createElement("button");
        this._btnElement.className = ActionClassNames.BTN;
        this._btnElement.innerText = this.label;
        if (this.tooltip) {
            this._btnElement.title = this.tooltip;
        }
        this._btnElement.addEventListener("click", this.action);
    }

    getElement() {
        return this._btnElement;
    }

    isHidden() {
        return this._btnElement.classList.contains("hidden");
    }

    hide() {
        if (!this.isHidden()) this._btnElement.classList.add("hidden");
    }

    show() {
        if (this.isHidden()) this._btnElement.classList.remove("hidden");
    }

    remove() {
        this._btnElement.removeEventListener("click", this.action);
        this._btnElement.remove();
    }
}
