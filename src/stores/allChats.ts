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

            if (!this.openedId || !this.openedIdExists) {
                const newUuid = this.openedId || generateUUID();

                this.createChat(newUuid);
                this.setOpened(newUuid);
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
                label: 'New Chat' + Math.floor(Math.random() * 999), // temporary number to distunguish chats
                messages: []
            });

            this.saveToLocalStorage();
        },
        deleteChat(uuid: string) {
            const chatToDeleteIndex = this.chats.findIndex((chat) => chat.id === uuid);

            if (chatToDeleteIndex === -1) {
                return;
            }

            this.chats.splice(chatToDeleteIndex, 1);
            
            this.saveToLocalStorage();
        },
        addMessage(role: MessageRole, content: string): string {
            const newMessageId = generateUUID();

            this.openedChat?.messages.push({
                id: newMessageId,
                role: role,
                content: content
            });

            this.saveToLocalStorage();

            return newMessageId;
        },
        modifyMessage(messageId: string, content: string, mode: 'append' | 'replace') {
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
        editChatName(uuid: string, newName: string) {
            const chatToEditIndex = this.chats.findIndex((chat) => chat.id === uuid);

            this.chats[chatToEditIndex].label = newName;
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem('chats', JSON.stringify(this.chats));
        }
    }
})