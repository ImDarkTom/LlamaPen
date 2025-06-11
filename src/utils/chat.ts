import router from "@/lib/router";
import useChatsStore from "@/stores/chatsStore";

export function promptDelete(chat: Chat) {
    if (confirm(`Are you sure you want to delete "${chat.title}"?`)) {
        useChatsStore().deleteChat(chat.id);
        router.push('/');
    }
}