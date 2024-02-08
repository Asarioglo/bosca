export interface IModifier {
    /**
     * Apply the modifier to the page.
     */
    apply(): void;
    /**
     * Show the modifications if they were hidden.
     */
    show(): void;
    /**
     * Hide the modifications, but don't remove the elements from the page.
     */
    hide(): void;
    /**
     * Remove the modifications from the page.
     */
    remove(): void;
}
