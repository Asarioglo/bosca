import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";
import { EventEmitter } from "../../../common/event-emitter";

export class PluginMessagingService extends EventEmitter {
    constructor(serviceProvider: IServiceProvider) {
        super();
    }
}
