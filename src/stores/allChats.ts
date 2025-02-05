import { defineStore } from "pinia";
import { v4 as generateUUID } from 'uuid';
import { emitter } from "../mitt";

interface AllChatsState {
    chats: Chat[],
    openedId: string | null,
    isGenerating: boolean,
}

export const useAllChatsStore = defineStore('allchats', {
    state: (): AllChatsState => ({
        chats: [],
        openedId: null,
        isGenerating: false,
    }),
    getters: {
        openedChat: (state) => state.chats.find(chat => chat.id === state.openedId),
        openedAsOllama: (state) => state.chats.find(chat => chat.id === state.openedId)?.messages.map((item) => {
            return {
                role: item.role,
                content: item.content
            }
        }),
        openedIdExists: (state) => state.chats.find(chat => chat.id === state.openedId) !== undefined,
    },
    actions: {
        findMessageById(id: string) {
            if (!this.openedChat) {
                return null;
            }

            return this.openedChat.messages.find((message) => message.id === id);
        },
        findChatIndexById(id: string) {
            return this.chats.findIndex((chat) => chat.id === id);
        },
        ensureChatInitialised() {
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
            try {
                const chats = JSON.parse(localStorage.getItem('chats') || "[]");

                this.chats = chats;
            } catch (error: unknown) {
                console.error('Failed to load chats from localStorage:', error);
                this.chats = [];
            }
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
            const chatToDeleteIndex = this.findChatIndexById(uuid);

            if (chatToDeleteIndex === -1) {
                return;
            }

            if (uuid === this.openedId) {
                this.openedId = null;
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
            const message = this.findMessageById(messageId);

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
            const chatToEditIndex = this.findChatIndexById(uuid);

            this.chats[chatToEditIndex].label = newName;
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem('chats', JSON.stringify(this.chats));
        },
        /**
         * Adds a new message to chat with ID `chatId` and sends a request to the `requestUrl` with the current opened chat as the message list.
         * @param userMessage The message added by the user.
         * @param options.chatId The chat ID to add the message to.
         * @param options.requestUrl The url to send the request to.
         * @param options.selectedModel The model to use. Added into the request payload.
         */
        async sendMessage(
            userMessage: string, 
            options: {
                chatId: string,
                requestUrl: string,
                selectedModel: string }
        ) {
            this.setOpened(options.chatId);
            this.ensureChatInitialised();

            this.addMessage('user', userMessage);
            
            const responseMessageId = this.addMessage('assistant', '');
            emitter.emit('scrollToBottom');

            const payload = JSON.stringify({
                model: options.selectedModel,
                messages: this.openedAsOllama,
                stream: true,
            });

            const response = await fetch(options.requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: payload,
            });

            if (!response.body) {
                throw new Error(`No response body recieved from sendMessage request, response code: ${response.status}`);
            }

            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();

            this.isGenerating = true;

            while (true) {
                const { done, value } = await reader.read();

                if (done || !this.isGenerating) {
                    this.isGenerating = false; // Ensure false if we stop generating normally
                    this.saveToLocalStorage();
                    break;
                }

                const chunkText = textDecoder.decode(value).trim().split('\n');

                for (const chunk of chunkText) {
                    try {
                        const chunkJson = JSON.parse(chunk);
                        const messageChunk = chunkJson.message.content;

                        this.modifyMessage(responseMessageId, messageChunk, 'append');
                    } catch (error: unknown) {
                        console.error('Error parsing response chunk', error);
                    }
                }
            }
        },
        editUserSentMessage(messageId: string, newMessageContent: string, options: { requestUrl: string, selectedModel: string }) {
            if (!this.openedChat || !this.openedId) {
                return;
            }

            const chatMessageIndex = this.openedChat.messages.findIndex((message) => message.id === messageId);

            this.openedChat.messages.splice(chatMessageIndex);
            this.saveToLocalStorage();

            this.sendMessage(newMessageContent, {
                chatId: this.openedId,
                requestUrl: options.requestUrl,
                selectedModel: options.selectedModel
            });
        }
    }
})