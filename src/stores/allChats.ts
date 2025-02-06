import { defineStore } from "pinia";
import { v4 as generateUUID } from 'uuid';
import { emitter } from "../mitt";
import { useConfigStore } from "./config";

interface AllChatsState {
    chats: Chat[],
    openedId: string | null,
    isGenerating: boolean,
};

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
        ensureChatInitialised(): string | null {
            this.loadChats();

            if (!this.openedId || !this.openedIdExists) {
                const newUuid = this.openedId || generateUUID();

                this.createChat(newUuid);
                this.setOpened(newUuid);
                this.saveToLocalStorage();
                return newUuid;
            }

            return null;
            
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
                label: 'New Chat',
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
            let chatId = options.chatId;
            const chatInitialisedResult = this.ensureChatInitialised();

            if (!options.chatId && typeof chatInitialisedResult === 'string') {
                chatId = chatInitialisedResult;
            }

            this.isGenerating = false; // Ensure any other connections are stopped.

            this.addMessage('user', userMessage);
            
            const responseMessageId = this.addMessage('assistant', '');
            emitter.emit('scrollToBottom');

            const payload = JSON.stringify({
                model: options.selectedModel,
                messages: this.openedAsOllama,
                stream: true,
            });

            const controller = new AbortController();
            const signal = controller.signal;

            const response = await fetch(options.requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: payload,
                signal: signal,
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
                    controller.abort('Cancelled response.');

                    this.isGenerating = false; // Ensure false if we stop generating normally
                    this.saveToLocalStorage();
                    this.generateChatTitle(chatId, options.selectedModel);
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
        },
        async generateChatTitle(chatId: string, selectedModel: string) {
            const selectedChat = this.chats.find((chat) => chat.id === chatId);

            if (!selectedChat) {
                throw new Error('Selected chat to generate title for doesn\'t exist');
            }

            const selectedChatMessages = selectedChat.messages;
            const firstTwoChatMessages = selectedChatMessages.slice(0, 2);

            if (!firstTwoChatMessages) {
                throw new Error('Chat does not have any messages.');
            }

            // https://github.com/open-webui/open-webui/blob/b72150c881955721a63ae7f4ea1b9ea293816fc1/backend/open_webui/config.py#L1097
            const generationPrompt = `Create a concise, 3-5 word title as a title for the chat history, in the given language. RESPOND ONLY WITH THE TITLE TEXT.

Examples of titles:
Stock Market Trends
Perfect Chocolate Chip Recipe
Evolution of Music Streaming
Remote Work Productivity Tips
Artificial Intelligence in Healthcare
Video Game Development Insights

<chat_history>
${firstTwoChatMessages.map((message) => {
    return `${message.role}: ${message.content}`
}).join('\n')}
</chat_history>
`.trim();

            const payload = JSON.stringify({
                model: selectedModel,
                stream: false,
                prompt: generationPrompt,
            });

            const response = await fetch(useConfigStore().apiUrl('/api/generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: payload,
            });

            const responseJson = await response.json();

            selectedChat.label = responseJson.response;
            this.saveToLocalStorage();
        },
    }
})