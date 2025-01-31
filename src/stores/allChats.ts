import { defineStore } from "pinia";
import { v4 as generateUUID } from 'uuid';

export const useAllChatsStore = defineStore('allchats', {
    state: () => ({
        chats: [] as Chat[],
        openedId: null as string | null,
    }),
    getters: {
        openedChat: (state) => state.chats.find(chat => chat.id === state.openedId) || null,
        openedAsOllama: (state) => state.chats.find(chat => chat.id === state.openedId)?.messages.map((item) => {
            return {
                role: item.role,
                content: item.content
            }
        }),
        openedIdExists: (state) => state.chats.find(chat => chat.id === state.openedId) !== undefined,
    },
    actions: {
        initialise() {
            this.loadChats();

            if (!this.openedId) {
                const newUuid = generateUUID();

                this.createChat(newUuid);
                this.setOpened(newUuid);
                this.saveToLocalStorage();
                return;
            }

            if (!this.openedIdExists) {
                this.createChat(this.openedId);
                this.setOpened(this.openedId);
                this.saveToLocalStorage();

                return;
            }

            
        },
        loadChats() {
            const chats = JSON.parse(localStorage.getItem('chats') || "[]");

            this.chats = chats;
        },
        setOpened(id: string | null) {
            this.openedId = id;
        },
        createChat(uuid: string) {
            this.chats.push({
                id: uuid,
                label: 'New Chat',
                messages: []
            });

            localStorage.setItem('chats', JSON.stringify(this.chats));
        },
        addMessage(role: MessageRole, content: string): string {
            const newMessageId = generateUUID();

            console.log(newMessageId);
            console.log(this.openedChat);

            this.openedChat?.messages.push({
                id: newMessageId,
                role: role,
                content: content
            });

            this.saveToLocalStorage();

            return newMessageId;
        },
        modifyMessage(messageId: string, content: string, mode: 'append' | 'replace') {
            console.log(this.openedChat);
            const message = this.openedChat?.messages.find((message) => message.id === messageId);

            if (!message) {
                throw new Error("Couldn't find message to modify.")
            }

            if (mode === 'append') {
                message.content += content;
            } else if (mode === 'replace') {
                message.content = content;
            }
        },
        saveToLocalStorage() {
            localStorage.setItem('chats', JSON.stringify(this.chats));
        }
    }
})