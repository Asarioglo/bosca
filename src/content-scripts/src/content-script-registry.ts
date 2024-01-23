import { AbstractContentScript } from "./abstract-content-script";

/**
 * Singleton class that holds all the content scripts.
 */
export class ContentScriptRegistry {
    private _registry: AbstractContentScript[] = [];
    private _global: AbstractContentScript[] = [];
    private static _instance: ContentScriptRegistry | null = null;

    private constructor() {}

    register(contentScript: AbstractContentScript): void {
        this._registry.push(contentScript);
    }

    registerGlobalScript(contentScript: AbstractContentScript): void {
        this._global.push(contentScript);
    }

    get(): AbstractContentScript[] {
        return this._registry;
    }

    launch(host: any): void {
        const context = {
            launched: 0,
        };

        for (let contentScript of this._registry) {
            if (contentScript.accept(host, context)) {
                contentScript.launch(host);
                context.launched++;
            }
        }

        for (let contentScript of this._global) {
            contentScript.launch(host, context);
            context.launched++;
        }
        console.log(`Launched ${context.launched} content scripts`);
    }

    static getInstance(): ContentScriptRegistry {
        if (!ContentScriptRegistry._instance) {
            ContentScriptRegistry._instance = new ContentScriptRegistry();
        }
        return ContentScriptRegistry._instance;
    }
}
