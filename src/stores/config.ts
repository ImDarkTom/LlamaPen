import { defineStore } from "pinia";

interface Config {
    ollamaUrl: string,
    showSidebar: boolean,
};

export const useConfigStore = defineStore('config', {
    state: (): Config => ({
        ollamaUrl: localStorage.getItem('customUrl') || 'http://localhost:11434',
        showSidebar: localStorage.getItem('showSidebar') === 'true' || true,
    }),
    getters: {
        apiUrl: (state) => (path: string) => `${state.ollamaUrl}${path}`,
    },
    actions: {
        setOllamaUrl(url: string) {
            this.ollamaUrl = url;
            localStorage.setItem('customUrl', url);
        },
        setShowSidebar(state: boolean) {
            this.showSidebar = state;
            localStorage.setItem('showSidebar', state.toString());
        }
    }
})