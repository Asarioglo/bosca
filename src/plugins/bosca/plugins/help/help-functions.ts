import { IHTTPLayer } from "../../../../core/background/src/core/http/i-http-layer";
import { Endpoints } from "../../config/endpoints";

export namespace HelpFunctions {
    export async function listFAQs(http_client: IHTTPLayer) {
        try {
            const faqs = await http_client.get(Endpoints.LIST_FAQ);
            return faqs;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}
