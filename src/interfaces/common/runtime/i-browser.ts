import { IExtension } from "./i-extension";
import { IRuntime } from "./i-runtime";
import { IStorage } from "./i-storage";
import { IWindows } from "./i-windows";

export interface IBrowser {
    runtime: IRuntime;
    windows: IWindows;
    storage: IStorage;
    extension: IExtension;
}
