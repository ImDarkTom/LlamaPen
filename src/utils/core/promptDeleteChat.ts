import router from "@/lib/router";
import useChatsStore from "@/stores/chatsStore";

/**
 * A small utility function so we keep the store seperate from any user/page-interaction logic.
 * @param chat Chat to delete.
 */
export function promptChatDeletion(chat: Chat) {
    if (confirm(`Are you sure you want to delete "${chat.title}"?`)) {
        useChatsStore().deleteChat(chat.id);
        router.push('/');
    }
}