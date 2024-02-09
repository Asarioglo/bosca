import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";
import { EventEmitter } from "../../../common/event-emitter";
import { IBrowser, IService } from "../../../interfaces";

export class PluginMessagingService extends EventEmitter implements IService {
    constructor() {
        super();
    }

    async start(
        browser: IBrowser,
        serviceProvider: IServiceProvider,
    ): Promise<void> {
        return;
    }

    isReady(): boolean {
        return true;
    }
}
