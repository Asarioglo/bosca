import { INodeInsertedCallback } from "../../interfaces/content-scripts/content/i-mutations";

export class MutationManager {
    private _nodeInsertedListeners: ((node: HTMLElement) => void)[];

    constructor() {
        this._nodeInsertedListeners = [];
        this._initializeMutationObserver();
    }

    public addNodeInsertedListener(listener: INodeInsertedCallback): void {
        this._nodeInsertedListeners.push(listener);
    }

    public removeNodeInsertedListener(listener: INodeInsertedCallback): void {
        this._nodeInsertedListeners = this._nodeInsertedListeners.filter(
            (l) => l !== listener,
        );
    }

    private _initializeMutationObserver(): void {
        const observer = new MutationObserver(this._onMutation.bind(this));
        observer.observe(document, {
            childList: true,
            subtree: true,
        });
    }

    private _onMutation(mutations: MutationRecord[]): void {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    for (let listener of this._nodeInsertedListeners) {
                        listener(node as HTMLElement);
                    }
                }
            }
        });
    }
}
