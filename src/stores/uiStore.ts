import { defineStore } from "pinia";

interface UIStore {
    chatList: {
        isScrollingDown: boolean,
    },
    connectedToOllama: boolean,
    mode: AppMode,
    openedChatId: number | null;
    openedNoteId: number | null;
}

export const useUiStore = defineStore('uiStore', {
    state: (): UIStore => ({
        chatList: {
            isScrollingDown: false,
        },
        mode: 'chat',
        connectedToOllama: false,
        openedChatId: null,
        openedNoteId: null,
    }),
    getters: {},
    actions: {
        setMode(newMode: AppMode) {
            this.mode = newMode;
            localStorage.setItem('mode', newMode);
        },
        setOpenedNote(id: number | null) {
            this.openedNoteId = id;
        },
        setOpenedChat(id: number | null) {
            this.openedChatId = id;
        },
        toggleMode() {
            if (this.mode === 'chat') {
                this.setMode('note');
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