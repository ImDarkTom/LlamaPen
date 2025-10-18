import db from "@/lib/db";
import logger from "@/lib/logger";
import { liveQuery } from "dexie";
import { ref, watch, type Ref } from "vue";

let liveSyncInitialised = false;

type RefReturn<T> = ReturnType<typeof ref<T>>;

export function initLiveSync(
    openedChatMessages: RefReturn<ChatMessage[]>,
    openedChatIdRef: Ref<number | null, number | null>
) {
    if (liveSyncInitialised) return;
    liveSyncInitialised = true;

    let openedMessagesSubscription: { unsubscribe: () => void } | null = null;

    watch(openedChatIdRef, (newId) => {
        if (openedMessagesSubscription) {
            openedMessagesSubscription.unsubscribe();
            openedMessagesSubscription = null;
        }

        if (newId === null) {
            openedChatMessages.value = [];
            return;
        }

        openedMessagesSubscription = liveQuery(() => db.messages.where('chatId').equals(newId).toArray()).subscribe({
            next: data => {
                openedChatMessages.value = data;
            },
            error: (e) => {
                console.error('Error during liveQuery for opened chat messages', e)
            }
        });
    });

    logger.info('Messages Store', 'Initialized live sync for messages store.');
}