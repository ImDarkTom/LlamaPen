import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [] as OllamaMessage[],
        isGenerating: false,
        scrollingDown: true,
    }),
    actions: {
        setGenerating(newValue: boolean) {
            this.isGenerating = newValue;
        },
        setMessages(newMessageList: OllamaMessage[]) {
            this.messages = newMessageList;
        },
        setScrollingDown(newValue: boolean) {
            this.scrollingDown = newValue;
        }
    },
    getters: {},
});