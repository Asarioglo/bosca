import { Message } from "../../../../../common/models/message";
import {
    AbstractPlugin,
    AbstractPluginParams,
} from "../../../core/plugin/abstract-plugin";
import Logger from "../../../core/utils/logger";
import { Context } from "../../../core/plugin/context";
import { HelpFunctions } from "./help-functions";

export class HelpPlugin extends AbstractPlugin<any> {
    private _logger = new Logger("HelpPlugin");
    constructor() {
        super("help");
        this._logger.disable();
    }

    async connect(...args: AbstractPluginParams) {
        super.connect(...args);
        return this;
    }

    getState() {
        return null;
    }

    async handlePortMessage(message: Message, context: Context) {}

    async handleAsyncMessage(message: Message, context: Context) {
        switch (message.type) {
            case "help:list-faqs":
                const faqs = await HelpFunctions.listFAQs(this._httpLayer);
                context.addResponseData(this.getName(), {
                    faqs,
                });
        }
    }

    async handleExternalMessage(message: Message, context: any) {}
}
