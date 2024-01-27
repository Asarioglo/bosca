export class EventEmitter {
    private _listeners: { [key: string]: Function[] } = {};

    constructor() {}

    public addListener(eventType: string, listener: Function): EventEmitter {
        if (!this._listeners[eventType]) {
            this._listeners[eventType] = [];
        }

        this._listeners[eventType].push(listener);
        return this;
    }

    public removeListener(eventType: string, listener: Function) {
        if (!this._listeners[eventType]) {
            return;
        }

        this._listeners[eventType] = this._listeners[eventType].filter(
            (l) => l !== listener,
        );
    }

    public emit(eventType: string, ...args: any[]) {
        if (!this._listeners[eventType]) {
            return;
        }

        this._listeners[eventType].forEach((listener) => {
            listener(...args);
        });
    }

    public once(eventType: string, listener: Function) {
        const onceListener = (...args: any[]) => {
            listener(...args);
            this.removeListener(eventType, onceListener);
        };

        this.addListener(eventType, onceListener);
    }

    public hasListeners(eventType?: string): number {
        if (!eventType) {
            return Object.keys(this._listeners).length;
        }
        return this._listeners[eventType] && this._listeners[eventType].length;
    }
}
