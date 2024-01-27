import { IBrowser } from "../../src/interfaces/common/runtime/i-browser";
import { IRuntime } from "../../src/interfaces/common/runtime/i-runtime";
import { IPort } from "../../src/interfaces/common/runtime/i-port";
import { IStorage } from "../../src/interfaces/common/runtime/i-storage";
import {
    IWindows,
    IWindow,
    IWindowOptions,
} from "../../src/interfaces/common/runtime/i-windows";

export class GenericEmitter<T1 = any, T2 = undefined, T3 = undefined> {
    callbacks: ((p1?: T1, p2?: T2, p3?: T3) => void)[] = [];

    addListener(callback: (p1: T1, p2: T2, p3: T3) => void): void;
    addListener(callback: (p1: T1, p2: T2) => void): void;
    addListener(callback: (p1: T1) => void): void;
    addListener(callback: () => void): void;
    addListener(callback: (...args: any[]) => void): void {
        this.callbacks.push(callback as any);
    }
    removeListener = jest.fn((callback: (p1: T1, p2: T2, p3: T3) => void) => {
        this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    });

    emit(p1?: T1, p2?: T2, p3?: T3): void {
        this.callbacks.forEach((cb) => cb(p1, p2, p3));
    }
}

export class MockPort implements IPort {
    name: string = "test_port";

    constructor(name: string) {
        this.name = name;
    }

    onMessage = new GenericEmitter();
    onDisconnect = new GenericEmitter();
    public postMessage = jest.fn();
}

export class MockStorage implements IStorage {
    public get = jest.fn();
    public set = jest.fn();
}

export class MockWindow implements IWindow {
    id?: number;
    type?: "normal" | "popup" | "panel";
    width?: number;
    height?: number;
    closed?: boolean;

    constructor(options?: IWindowOptions) {
        if (options) {
            this.type = options.type;
            this.width = options.width;
            this.height = options.height;
            this.id = 1;
            this.closed = false;
        }
    }
}

export class MockWindows implements IWindows {
    create = jest.fn(async (options: IWindowOptions): Promise<IWindow> => {
        return new MockWindow(options);
    });
    remove = jest.fn();
    onRemoved = new GenericEmitter();
}

export class MockRuntime implements IRuntime {
    connect = jest.fn(
        (options: { name: string }): IPort => new MockPort(options.name),
    );

    onConnect = new GenericEmitter<IPort, undefined, undefined>();
    onConnectExternal = new GenericEmitter<IPort>();

    onMessage = new GenericEmitter<any, any, Function>();

    onMessageExternal = new GenericEmitter<any, any, Function>();

    onInstalled = new GenericEmitter();
    getManifest = jest.fn(() => ({ version: "1.0.0" }));
    sendMessage = jest.fn();
}

export default () =>
    ({
        runtime: new MockRuntime(),
        storage: new MockStorage(),
        windows: new MockWindows(),
    }) as IBrowser;
