export interface INotifier {
    showNotification(type: string, message: string): void;
}
declare var INotifier: {
    prototype: INotifier;
    new (appName: string): INotifier;
};
