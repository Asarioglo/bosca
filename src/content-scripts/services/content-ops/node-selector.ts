export type SelectorOptions = {
    id?: string;
    class?: string;
    type?: string;
};

export class NodeSelector {
    constructor(private _options: SelectorOptions) {}

    public matches(node: HTMLElement): boolean {
        if (this._options.id && node.id !== this._options.id) {
            return false;
        }

        if (
            this._options.class &&
            !node.classList?.contains(this._options.class)
        ) {
            return false;
        }

        if (
            this._options.type &&
            node.tagName?.toLowerCase() !== this._options.type
        ) {
            return false;
        }

        return true;
    }
}
