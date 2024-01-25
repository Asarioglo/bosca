import { IWindowService } from "../../../../core/background/src/core/services/i-window-service";
import { BoscaConfigService } from "../../config/config";
import { Endpoints } from "../../config/endpoints";

export namespace AuthFunctions {
    export function openAuthFlow(
        windowService: IWindowService,
        configService: BoscaConfigService,
    ) {
        const baseURL = configService.get("baseURL");
        const loginEndpoint = Endpoints.AUTH_NORMAL;

        const authURL = `${baseURL}${loginEndpoint}`;
        windowService.openWindow(authURL, 500, 600);
    }
}
