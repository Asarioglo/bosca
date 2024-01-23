import { IWindow } from "../../../../common/runtime/i-windows";

export interface IWindowService {
    openWindow(
        url: string,
        width: number,
        height: number,
        type?: "popup" | "panel" | "normal",
        closedCallback?: () => void,
    ): Promise<IWindow>;

    closeAllWindows(): void;
}
