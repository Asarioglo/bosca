export interface IContentScript {
    /**
     * Called when the content script is needed. Expected to modify the page
     * as needed.
     */
    init(): void;
    /**
     * Called when the content script is no longer needed. Expected to remove
     * any modifications made to the page.
     */
    destroy(): void;
    /**
     * When the app initializes on a page, it will call this method to determine
     * if the content script should be activated.
     * @param url The URL of the current page.
     */
    accepts(url: string): boolean;
}

export const ACCEPT_ALL_REGEX = /^(https?:\/\/[^\s]+)$/;
