import {
    IWindow,
    IWindows,
} from "../../../interfaces/common/runtime/i-windows";

export class WindowService {
    private _openWindows: { [key: string]: IWindow };
    private _windows: IWindows;

    constructor(windows: IWindows) {
        this._windows = windows;
        this._openWindows = {};
    }

    closeAllWindows() {
        if (!this._windows) {
            throw new Error("Windows service is not initialized");
        }
        for (let windowId in this._openWindows) {
            if (!this._openWindows[windowId].closed) {
                this._windows.remove(parseInt(windowId));
            }
        }
        this._openWindows = {};
    }

    getOpenWindows(): [string, IWindow][] {
        return Object.entries(this._openWindows);
    }

    async openWindow(
        url: string,
        width: number,
        height: number,
        type: "popup" | "panel" | "normal" = "popup",
        closedCallback?: () => void,
    ) {
        if (!this._windows) {
            throw new Error("Windows service is not initialized");
        }
        this.closeAllWindows();
        const window = await this._windows.create({
            url,
            type,
            width,
            height,
        });
        if (!window || !window.id) {
            throw new Error("Failed to open window");
        }

        this._openWindows[window.id] = window;

        const onRemoved = (windowId: number) => {
            if (this._openWindows[windowId]) {
                delete this._openWindows[windowId];
            }
            if (closedCallback) {
                closedCallback();
            }
            this._windows.onRemoved.removeListener(onRemoved);
        };

        this._windows.onRemoved.addListener(onRemoved);
        return window;
    }
}
