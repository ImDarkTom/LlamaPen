import { defineStore } from "pinia";

interface UIStore {
    chatList: {
        isScrollingDown: boolean,
    },
    connectedToOllama: boolean,
    mode: AppMode,
}

export const useUiStore = defineStore('uiStore', {
    state: (): UIStore => ({
        chatList: {
            isScrollingDown: false,
        },
        mode: 'chat',
        connectedToOllama: false,
    }),
    getters: {},
    actions: {
        setMode(newMode: AppMode) {
            this.mode = newMode;
            localStorage.setItem('mode', newMode);
        },
        toggleMode() {
            if (this.mode === 'chat') {
                this.setMode('textpad');
            } else {
                this.setMode('chat');
            }
        },
        setScrollingDown(status: boolean) {
            this.chatList.isScrollingDown = status;
        },
        setConnectedToOllama(status: boolean) {
            this.connectedToOllama = status;
        }
    }
})