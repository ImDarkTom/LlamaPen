import { liveQuery } from 'dexie';
import { defineStore } from 'pinia';
import { db, type Chat, type ChatMessage, type ChatMessageRole } from '~/lib/dexie';

type RefReturn<T> = ReturnType<typeof ref<T>>;

// Setup Dexie live sync for Vue
let liveSyncInitialised = false;

function initLiveSync(
    chats: RefReturn<Chat[]>,
    openedChatIdRef: Ref<number | null, number | null>,
    openedChatMessages: RefReturn<ChatMessage[]>,
    // pinnedChats: RefReturn<Chat[]>,
    // unpinnedChats: RefReturn<Chat[]>,
) {
    if (liveSyncInitialised) return;

    liveSyncInitialised = true;

    // Chats
    liveQuery(() => db.chats.toArray()).subscribe({
        next: (data) => {
            chats.value = data;
        },
        error: (e) => {
            console.error('Error subscribing to liveQuery for chats: ', e);
        },
    });

    // Messages
    let openedChatMessagesSubscription: { unsubscribe: () => void } | null = null;

    // Watch the openedChatId ref for changes
    watch(openedChatIdRef, (newId) => {
        console.log('resub');
        if (openedChatMessagesSubscription) {
            openedChatMessagesSubscription.unsubscribe();
            openedChatMessagesSubscription = null;
        }

        if (newId === null) {
            openedChatMessages.value = [];
            return;
        }

        openedChatMessagesSubscription = liveQuery(() => db.chatMessages.where('chatId').equals(newId).toArray()).subscribe({
            next: (data) => {
                openedChatMessages.value = data;
            },
            error: (e) => {
                console.error('Error during liveQuery for opened chat messages: ', e);
            },
        });
    });
    console.log('✅ Setup liveQuery for chats store.');
}

export const useChatsStore = defineStore('chats', () => {
    const chats = ref<Chat[]>([]);
    const openedChatId = ref<number | null>(null);
    const openedChatMessages = ref<ChatMessage[]>([]);

    initLiveSync(chats, openedChatId, openedChatMessages);

    async function createNewChat() {
        const newChatId = await db.chats.add({
            title: 'New Chat',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            pinned: 0,
        });

        return newChatId;
    }

    async function addMessageToChat(chatId: number, role: ChatMessageRole, content: string) {
        // Returns id of message created.
        return await db.chatMessages.add({
            chatId,
            role,
            content,
            createdAt: new Date().getTime(),
        });
    }

    /**
     * Send a message as the user to a chat, getting a response.
     * @param chatId Chat to send the message into
     * @param contents The message contents
     */
    async function sendMessage(chatId: number | null, contents: string) {
        // Ensure there is an opened chat by making one if there is none
        if (!chatId) {
            openedChatId.value = await createNewChat();
        }
        else {
            openedChatId.value = chatId;
        }

        // Add the message to the chat
        addMessageToChat(openedChatId.value, 'user', contents);
    }

    return {
        chats,
        openedChatId,
        openedChatMessages,
        sendMessage,
    };
});
