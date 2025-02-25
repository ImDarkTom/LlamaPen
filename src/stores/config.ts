import { defineStore } from "pinia";

interface Config {
    showSidebar: boolean,
};

export const useConfigStore = defineStore('config', {
    state: (): Config => ({
        showSidebar: localStorage.getItem('showSidebar') === 'true' || true,
    }),
    actions: {
        setShowSidebar(state: boolean) {
            this.showSidebar = state;
            localStorage.setItem('showSidebar', state.toString());
        }
    }
})