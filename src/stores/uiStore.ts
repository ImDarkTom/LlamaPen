import { defineStore } from "pinia";
import { useConfigStore } from './config';

interface UIStore {
    chat: {
        isScrollingDown: boolean,
    },
    setConnectedToOllama: boolean,
}

/**
 * Misc util state variables used throughout UI.
 */
export const useUiStore = defineStore('uiStore', {
    state: (): UIStore => ({
        chat: {
            isScrollingDown: false,
        },
        setConnectedToOllama: false,
    }),
    getters: {
        isConnectedToOllama(): boolean {
            const configStore = useConfigStore();
            return configStore.api.enabled || this.setConnectedToOllama;
        }
    },
    actions: {}
});