import { IBrowser, IService, IServiceProvider } from "../../../interfaces";
import { NodeSelector, SelectorOptions } from "./node-selector";

export type IChangeCallback = (node: HTMLElement) => void;

type Subscription = {
    selector: NodeSelector;
    callback: IChangeCallback;
};

/**
 * A service which handles insertion, removal, change in state of the DOM nodes.
 * It uses MutationObserver to listen to the changes in the DOM and can detect
 * changes by a class, id, or any other attribute.
 */
export class NodeLifecycleService implements IService {
    private _insertedSubscriptions: Subscription[];
    private _removedSubscriptions: Subscription[];
    private _mutationObserver: MutationObserver | null = null;

    constructor() {
        this._insertedSubscriptions = [];
        this._removedSubscriptions = [];
    }

    async start(
        browser: IBrowser,
        serviceProvider: IServiceProvider,
    ): Promise<void> {
        this._initializeMutationObserver();
    }

    isReady(): boolean {
        return this._mutationObserver !== null;
    }

    /**
     * Add a listener for the inserted nodes which match the selector.
     */
    public onInserted(
        selectorOptions: SelectorOptions,
        callback: IChangeCallback,
    ): void {
        this._insertedSubscriptions.push({
            selector: new NodeSelector(selectorOptions),
            callback,
        });
    }

    /**
     * Add a listener for the removed nodes which match the selector.
     */
    public onRemoved(
        selectorOptions: SelectorOptions,
        callback: IChangeCallback,
    ): void {
        this._removedSubscriptions.push({
            selector: new NodeSelector(selectorOptions),
            callback,
        });
    }

    private _initializeMutationObserver(): void {
        const observer = new MutationObserver(this._onMutation.bind(this));
        observer.observe(document, {
            childList: true,
            subtree: true,
        });
        this._mutationObserver = observer;
    }

    private _onMutation(mutations: MutationRecord[]): void {
        mutations.forEach((mutation) => {
            if (
                mutation.addedNodes &&
                mutation.addedNodes.length > 0 &&
                this._insertedSubscriptions.length > 0
            ) {
                for (let node of mutation.addedNodes) {
                    for (let subscription of this._insertedSubscriptions) {
                        if (
                            subscription.selector.matches(node as HTMLElement)
                        ) {
                            subscription.callback(node as HTMLElement);
                        }
                    }
                }
            }
            if (
                mutation.removedNodes &&
                mutation.removedNodes.length > 0 &&
                this._removedSubscriptions.length > 0
            ) {
                for (let node of mutation.removedNodes) {
                    for (let subscription of this._removedSubscriptions) {
                        if (
                            subscription.selector.matches(node as HTMLElement)
                        ) {
                            subscription.callback(node as HTMLElement);
                        }
                    }
                }
            }
        });
    }
}
