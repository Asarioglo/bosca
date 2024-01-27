import { IStorage } from "../../../interfaces/common/runtime/i-storage";

export const ChromeSyncStorage = {
    get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[key]);
                }
            });
        });
    },

    set(key: string, value: any): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    },
} as IStorage;
