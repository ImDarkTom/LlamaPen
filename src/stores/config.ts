import { defineStore } from "pinia";

export const useConfigStore = defineStore('config', {
    state: () => ({
        ollamaUrl: localStorage.getItem('customUrl') || 'http://localhost:11434',
    }),
    getters: {
        apiUrl: (state) => (path: string) => `${state.ollamaUrl}${path}`,
    },
    actions: {
        setOllamaUrl(url: string) {
            this.ollamaUrl = url;
            localStorage.setItem('customUrl', url);
        }
    }
})