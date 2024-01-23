import { IHTTPLayer } from "../../../core/http/i-http-layer";
import { HTTPLayer } from "../../../core/http/impl/http-layer";
import Logger from "../../../core/utils/logger";
import { Endpoints } from "../../config/endpoints";

export namespace UserFunctions {
    const logger = new Logger("UserFunctions");
    export async function ping(HTTPLayer: IHTTPLayer) {
        try {
            const response = await HTTPLayer.get(Endpoints.PING);
            return response;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    export async function getFullUserObject(
        httpLayer: IHTTPLayer,
        reason?: string,
    ) {
        try {
            const user = await httpLayer.get(Endpoints.MAIN_USER, {
                full: "true",
                reason: reason || "unknown",
            });
            return user.user;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    export async function saveUserSettings(
        httpLayer: IHTTPLayer,
        changes: any,
    ) {
        try {
            const newUser = await httpLayer.put(
                Endpoints.UPDATE_APP_CONFIG,
                changes,
            );
            return newUser;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
