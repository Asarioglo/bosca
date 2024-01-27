// Assuming you'll import required classes and types from other modules.
import { AbstractContentScript } from "../../abstract-content-script";
import { Config } from "../../connection/iconfig";
import { ContentApp } from "../../content-app";
import { Message } from "../../../../interfaces/common/messaging/message";
import { GlobalMessageType } from "../../../../common/messaging/message-types";
import { IRuntime } from "../../../../common/runtime/i-runtime";
import "./content.css";

export class AllSitesContentScript extends AbstractContentScript {
    private initialized: boolean = false;
    private app: ContentApp | null = null;
    private _appName: string;

    constructor(runtime: IRuntime, appName: string) {
        // Global script, no host needed
        super(runtime);
        this._appName = appName;
    }

    // Rest of the methods remain largely the same, but you'll add type annotations
    // wherever possible based on what's expected.

    launch(): void {
        this.app = new ContentApp(this.runtime, this._appName);
        this.app.addMessageListener(
            GlobalMessageType.CONFIG_CHANGED,
            (message: Message) => {
                let config = message.payload;
                if (!config) return;
                this.applyConfiguration(config as Config);
            },
        );
        this.app.addNodeInsertedListener(this.onNodeInserted.bind(this));
    }

    onNodeInserted(node: Element): void {
        if (
            node.nodeType !== Node.ELEMENT_NODE ||
            !node.classList ||
            !this.initialized
        ) {
            return;
        }
    }

    async kickOffContentScript(config: Config): Promise<void> {
        this.initialized = true;
    }

    // Should be called when the user is authenticated
    applyConfiguration(configObj: Config): void {
        if (configObj && !this.initialized) {
            this.kickOffContentScript(configObj);
        }
    }
}
