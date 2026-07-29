import { defineStore } from 'pinia';
import { ref } from 'vue';

export type SidebarMode = 'chats' | 'models' | 'tools' | 'settings';

const useSidebarStore = defineStore('sidebar', () => {
    const sidebarMode = ref<SidebarMode>('chats');

    function setSidebarMode(mode: SidebarMode) {
        sidebarMode.value = mode;
    }

    return {
        sidebarMode,
        setSidebarMode,
    }
});

export default useSidebarStore;