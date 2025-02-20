import { defineStore } from "pinia";

interface UIStore {
    chatList: {
        isScrollingDown: boolean,
    },
    connectedToOllama: boolean,
}

export const useUiStore = defineStore('uiStore', {
    state: (): UIStore => ({
        chatList: {
            isScrollingDown: false,
        },
        connectedToOllama: false,
    }),
    getters: {},
    actions: {
        setScrollingDown(status: boolean) {
            this.chatList.isScrollingDown = status;
        },
        setConnectedToOllama(status: boolean) {
            this.connectedToOllama = status;
        }
    }
})