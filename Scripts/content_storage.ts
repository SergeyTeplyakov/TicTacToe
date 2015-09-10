/// <reference path="state.ts"/>

module Control {

    const permanentStateKey = "score";
    const temporaryStateKey = "gameState";
    const defaultStorageName = "fakeStorage";

    export class ContentStorage {
        private storage;

        constructor(storageName?: string) {
            this.storage = createStorage(storageName || defaultStorageName);
        }
     
        getGameStatistics(): Model.GameStatistics {
            var stateJson = this.getGameStatisticsCore();
            return stateJson ? JSON.parse(stateJson) : null;
        }

        /*internal*/getGameStatisticsCore(): string {
            return this.storage.getItem(permanentStateKey);
        }

        updateGameStatistics(state: Model.GameStatistics) {
            this.storage.setItem(permanentStateKey, JSON.stringify(state));
        }

        getGameState(): Model.GameSnapshot {
            var stateJson = this.getGameStateCore();
            return stateJson ? JSON.parse(stateJson) : null;
        }

        /*internal*/getGameStateCore(): string {
            return this.storage.getItem(temporaryStateKey);
        }

        updateGameState(state: Model.GameSnapshot) {
            this.storage.setItem(temporaryStateKey, JSON.stringify(state));
        }

        reset() {
            this.storage.setItem(permanentStateKey, null);
            this.storage.setItem(temporaryStateKey, null);
        }
    }

    class CustomLocalStorage implements Storage {
        // TODO: switch to Map<??, string>. Is there anything like this in TS?s
        private data: any = {};

        setItem(key: string, data: string): void {
            this.data[key] = data;
        }

        getItem(key: string): any {
            return this.data.hasOwnProperty(key) ? this.data[key] : undefined;
        }

        removeItem(key: string): void {
            delete this.data[key];
        }

        clear(): void {
            this.data = {};
        }

        length: number;
        key: any;

        [key: string]: any;
    }

    function createStorage(storageName: string): Storage {
        function localStorageSupported(): boolean {
            var testKey = "test";
            var storage = window.localStorage;

            try {
                storage.setItem(testKey, "1");
                storage.removeItem(testKey);
                return true;
            } catch (error) {
                return false;
            }
        }

        if (localStorageSupported()) {
            return window.localStorage;
        }

        let storage = window[storageName];
        if (!storage) {
            storage = new CustomLocalStorage();
            window[storageName] = storage;
        }

        return storage;
    }

}