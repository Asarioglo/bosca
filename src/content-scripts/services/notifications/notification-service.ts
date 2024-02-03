import { NotificationType } from "../../../common";
import { INotifier, IService } from "../../../interfaces";
import { IServiceProvider } from "../../../interfaces/background/services/i-service-provider";
import { DefaultNotifier } from "./default-notifier";

export class NotificationService implements IService {
    public name: string = "notification-service";
    private _showAppName: boolean = true;
    private notifier: INotifier;
    private _appName: string;
    private _enabled: boolean = true;

    constructor(serviceProvider: IServiceProvider, appName: string) {
        this.notifier = new DefaultNotifier();
        this._appName = appName;
    }

    public includeAppNameInMsg(include: boolean) {
        this._showAppName = include;
    }

    public setNotifier(notifier: INotifier) {
        this.notifier = notifier;
    }

    public enable() {
        this._enabled = true;
    }

    public disable() {
        this._enabled = false;
    }

    public showNotification(type: NotificationType, message: string): void {
        if (!this._enabled) return;
        let msg = this._showAppName ? `${this._appName}: ${message}` : message;
        this.notifier.showNotification(type, msg);
    }
}
