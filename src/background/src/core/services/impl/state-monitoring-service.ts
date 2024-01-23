/**
 * This service is not used anywhere, because for now there was no use-case
 * where the sate didn't change as a result of a port or async message.
 * All states trickle down from one plugin to another, so with a careful opdering
 * of plugins there should be no need for this service. We will see.
 */

import { EventEmitter } from "../../event-emitter";

export enum StateEvents {
    STATE_CHANGED = "state-changed",
}
export class StateMonitoringService extends EventEmitter {
    static _instance: StateMonitoringService | null = null;

    static getInstance(): StateMonitoringService {
        if (!StateMonitoringService._instance) {
            StateMonitoringService._instance = new StateMonitoringService();
        }
        return StateMonitoringService._instance;
    }

    notifyStateChanged(pluginName: string, state: any) {
        this.emit(StateEvents.STATE_CHANGED, pluginName, state);
    }
}
