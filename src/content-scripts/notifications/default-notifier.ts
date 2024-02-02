import StartToastifyInstance from "toastify-js";
import "toastify-js/src/toastify.css";
import "../assets/styles/notification.styles.css"
import { INotifier } from "../../interfaces/content-scripts/notifications/i-notifier";

export class DefaultNotifier implements INotifier {
    private _appName: string;
    private _duration = 3000;
    private _position = "bottom";
    private _types: Record<string, any> = {
        success: { className: "toastify-success" },
        error: { className: "toastify-error" },
        warning: { className: "toastify-warning" },
        info: { className: "toastify-info" },
    };

    constructor(appName: string = "Bosca") {
        this._appName = appName;
    }

    showNotification(type: string, message: string): void {
        if (!type) {
            type = "info";
        }
        let typeConfig = this._types[type] || this._types.info;

        const instance = StartToastifyInstance({
            text: `${this._appName}: ${message}`,
            duration: this._duration,
            gravity: this._position,
            ...typeConfig,
        })
        instance.showToast();
    }

    setDuration(duration: number): void {
        this._duration = duration;
    }
}
