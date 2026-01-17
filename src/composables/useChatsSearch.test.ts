import { setActivePinia, createPinia } from 'pinia';
import useChatsStore from '@/stores/chatsStore';
import { beforeEach, describe, expect, it } from 'vitest';
import { useChatSearch } from './useChatSearch';

describe('useChatSearch composable', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        const store = useChatsStore()
        store.$patch({
            chats: [
                {
                    id: 1,
                    title: 'Chat One',
                    createdAt: new Date('2025-01-01'),
                    lastestMessageDate: new Date('2025-01-02'),
                    pinned: 0
                },
                {
                    id: 2,
                    title: 'Chat Two',
                    createdAt: new Date('2025-01-02'),
                    lastestMessageDate: new Date('2025-01-04'),
                    pinned: 1
                },
                {
                    id: 3,
                    title: 'Chat Three',
                    createdAt: new Date('2025-01-03'),
                    lastestMessageDate: new Date('2025-01-03'),
                    pinned: 0
                },
            ]
        });
    })

    it('shows all chats with no filter', () => {
        const { filteredChats } = useChatSearch()
        expect(filteredChats.value.length).toBe(3)
    });

    it('defaults to sorting by last interaction', () => {
        const { filteredChats } = useChatSearch();

        expect(filteredChats.value[0]!.id).toBe(2)
    });

    it('filters to only pinned', () => {
        const { filteredChats, userFilter } = useChatSearch();

        userFilter.value = 'pinned';

        expect(filteredChats.value.length).toBe(1);
        expect(filteredChats.value[0]!.title).toBe('Chat Two');
    });

    it('searches chats case-insensitively', () => {
        const { filteredChats, searchQuery } = useChatSearch();

        searchQuery.value = 'cHaT tWo';

        expect(filteredChats.value.length).toBe(1);
        expect(filteredChats.value[0]!.title).toBe('Chat Two');
    });

    it('sorts by created + reversed or non-reversed', () => {
        const { filteredChats, sortType, reverseSort } = useChatSearch();

        sortType.value = 'created';
        reverseSort.value = true;

        expect(filteredChats.value[0]!.title).toBe('Chat One');

        reverseSort.value = false;
        expect(filteredChats.value[2]!.title).toBe('Chat One');
    });

    it('sorts by latest activity + unpinned', () => {
        const { filteredChats, sortType, userFilter } = useChatSearch();

        sortType.value = 'latest-activity';
        userFilter.value = 'unpinned';

        expect(filteredChats.value.length).toBe(2);
        expect(filteredChats.value[0]!.title).toBe('Chat Three');
    });
})