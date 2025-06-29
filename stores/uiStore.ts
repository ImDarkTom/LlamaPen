import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', () => {
    const sidebarOpen = ref(true);

    return { sidebarOpen };
}, {
    persist: true,
});
