import { defineStore } from "pinia";

interface UIStore {
    chatList: {
        isScrollingDown: boolean,
    },
    connectedToOllama: boolean,
    openedChatId: number | null;
}

/**
 * Misc util state variables used throughout UI.
 */
export const useUiStore = defineStore('uiStore', {
    state: (): UIStore => ({
        chatList: {
            isScrollingDown: false,
        },
        connectedToOllama: false,
        openedChatId: null,
    }),
    getters: {},
    actions: {
        setOpenedChat(id: number | null) {
            this.openedChatId = id;
        },
        setScrollingDown(status: boolean) {
            this.chatList.isScrollingDown = status;
        },
        setConnectedToOllama(status: boolean) {
            this.connectedToOllama = status;
        }
    }
})