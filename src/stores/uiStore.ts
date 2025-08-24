import { defineStore } from "pinia";

interface UIStore {
    chat: {
        isScrollingDown: boolean,
        selectedModelInfo: OllamaModelInfoResponse | null
    }
}

/**
 * Misc util state variables used throughout UI.
 */
export const useUiStore = defineStore('uiStore', {
    state: (): UIStore => ({
        chat: {
            isScrollingDown: true,
            selectedModelInfo: null,
        }
    }),
    getters: {},
    actions: {}
});