import { IContentScript } from "../../interfaces/content-scripts/scripts/i-content-script";
import { IScriptRegistry } from "../../interfaces/content-scripts/scripts/i-script-registry";

/**
 * Singleton class that holds all the content scripts.
 */
export class ContentScriptRegistry implements IScriptRegistry {
    private _registry: IContentScript[] = [];

    private constructor() {}

    register(contentScript: IContentScript): void {
        this._registry.push(contentScript);
    }

    getAll(): IContentScript[] {
        return this._registry;
    }

    launch(host: string): void {
        const context = {
            launched: 0,
        };

        for (let contentScript of this._registry) {
            if (contentScript.accepts(host)) {
                contentScript.init();
                context.launched++;
            }
        }

        console.log(`Launched ${context.launched} content scripts`);
    }

    match(url: string): IContentScript[] {
        return this._registry.filter((script) => script.accepts(url));
    }
}
