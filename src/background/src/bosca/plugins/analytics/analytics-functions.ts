import { IHTTPLayer } from "../../../core/http/i-http-layer";
import { Endpoints } from "../../config/endpoints";
import { Metric } from "./analytics-plugin";
import urlJoin from "url-join";

export namespace AnalyticsFunctions {
    export async function ship(
        baseURL: string,
        metrics: Metric[],
        httpLayer: IHTTPLayer,
    ) {
        try {
            const url = urlJoin(baseURL, Endpoints.LOG_BATCH);
            // TODO: this can potentially send a big amount of data
            await httpLayer.post(url, { metrics });
            return true;
        } catch (error) {
            return false;
        }
    }
}
