import { IContentScript } from "./i-content-script";

/**
 * Interface for the script registry. Registry is responsible for registering
 * scripts, launching them when appropriate, and destroying them when appropriate.
 */
export interface IScriptRegistry {
    /**
     * Registers a script with the registry.
     * @param script The script to register.
     */
    register(script: IContentScript): void;
    /**
     * Gets all the registered scripts.
     * @returns All the registered scripts.
     */
    getAll(): any[];

    /**
     * Launches all the registered scripts.
     * @param host The url of the current page.
     */
    launch(url: string): void;

    /**
     * Returns a list of scripts that match the given host url.
     * @param url The host object.
     */
    match(url: string): IContentScript[];
}
