export interface IWindowOptions {
    url: string;
    type?: "normal" | "popup" | "panel";
    width?: number;
    height?: number;
}

export interface IWindow {
    id?: number;
    type?: "normal" | "popup" | "panel";
    width?: number;
    height?: number;
    closed?: boolean;
}

export interface IWindows {
    create(options: IWindowOptions): Promise<IWindow>;
    remove(windowId: number): Promise<void>;
    onRemoved: {
        addListener: (callback: (windowId: number) => void) => void;
        removeListener: (callback: (windowId: number) => void) => void;
    };
}
