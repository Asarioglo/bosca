import { Message } from "../../../../core/interfaces/common/messaging/message";
import { GlobalEvents } from "../../../../core/background/src/core/global-events";
import {
    AbstractPlugin,
    AbstractPluginParams,
} from "../../../../core/background/src/core/plugin/abstract-plugin";
import Logger from "../../../../core/background/src/core/utils/logger";
import { AnalyticsFunctions } from "./analytics-functions";

export interface Metric {
    message: string;
    timestamp: number;
}

export class AnalyticsPlugin extends AbstractPlugin<any> {
    private _logger = new Logger("AnalyticsPlugin");
    private _analyticsBaseURL!: string;
    private _version!: string;
    private _batchSize = 20;
    private _metricMessages: Metric[] = [];

    constructor() {
        super("analytics");
        this._logger.disable();
    }

    async connect(...args: AbstractPluginParams) {
        super.connect(...args);
        this._internalRelay.addListener(
            GlobalEvents.LOG_METRIC,
            (message: string) => {
                this.logMetric(message);
            },
        );
        this._analyticsBaseURL = this._configService.get("analyticsURL") || "";
        this._version = this._configService.get("version");
        this._batchSize =
            this._configService.get("metricsBatchSize") || this._batchSize;
        return this;
    }

    private async logMetric(message: string) {
        if (!message) {
            return;
        }
        this._metricMessages.push({
            message: `[${this._version}] ${message}`,
            timestamp: Date.now(),
        });
        if (this._metricMessages.length >= this._batchSize) {
            const shipped = await AnalyticsFunctions.ship(
                this._analyticsBaseURL,
                this._metricMessages,
                this._httpLayer,
            );
            if (shipped) {
                this._metricMessages = [];
            }
        }
    }

    async handlePortMessage(message: Message) {
        switch (message.type) {
            case "log-metric":
                this.logMetric(message?.payload?.metric);
                break;
        }
        return;
    }

    async handleAsyncMessage() {
        return;
    }

    async handleExternalMessage() {
        return;
    }
}
