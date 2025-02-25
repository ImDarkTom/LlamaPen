import { defineStore } from "pinia";

interface UIStore {
    chatList: {
        isScrollingDown: boolean,
    }
}

export const useUiStore = defineStore('uiStore', {
    state: (): UIStore => ({
        chatList: {
            isScrollingDown: false,
        },
    }),
    getters: {},
    actions: {
        setScrollingDown(status: boolean) {
            this.chatList.isScrollingDown = status;
        }
    }
})