import useChatsStore from "@/stores/chatsStore";
import { computed, ref } from "vue";

export type SearchSortTypes = 'latest-activity' | 'created' | 'alphabetically';
export type UserFilterTypes = 'all' | 'pinned' | 'unpinned';

export function useChatSearch() {
    const chatsStore = useChatsStore();

    const searchQuery = ref('');
    const sortType = ref<SearchSortTypes>('latest-activity');
    const userFilter = ref<UserFilterTypes>('all')
    const reverseSort = ref(false);

    const sortTypeMap: Record<SearchSortTypes, (a: Chat, b: Chat) => number> = {
        'latest-activity': (a, b) => (b.lastestMessageDate?.getTime() || 0) - (a.lastestMessageDate?.getTime() || 0),
        'created': (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        'alphabetically': (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
    }

    const userFilterMap: Record<'all' | 'pinned'| 'unpinned', (chat: Chat) => boolean> = {
        'all': () => true,
        'pinned': (chat) => chat.pinned === 1,
        'unpinned': (chat) => chat.pinned === 0,
    }

    const filteredChats = computed(() => {
        const sortedChats = chatsStore.chats
            .sort((a, b) => sortTypeMap[sortType.value](a, b))
            .filter((chat) => userFilterMap[userFilter.value](chat))
            .filter((chat) => 
                chat.title.toLowerCase().includes(searchQuery.value.toLowerCase())
            );  

        if (reverseSort.value) {
            sortedChats.reverse();
        }

        return sortedChats;
    });

    return {
        searchQuery,
        sortType,
        userFilter,
        reverseSort,
        filteredChats,
    }
}