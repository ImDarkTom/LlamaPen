<script setup lang="ts">
import { useChatSearch } from '@/composables/useChatSearch';
import { emitter } from '@/lib/mitt';
import router from '@/lib/router';
import { nextTick } from 'process';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { BiFilterAlt, BiTimeFive } from 'vue-icons-plus/bi';
import { PiSparkleFill } from 'vue-icons-plus/pi';

const {
    filteredChats,
    userFilter,
    sortType,
    reverseSort,
    searchQuery
} = useChatSearch();

const isShowingSearchMenu = ref(false);
const isShowingFiltersMenu = ref(false);
const selectedIndex = ref(0);

const queryInputRef = ref<HTMLInputElement | null>(null);
const queryItemsRef = ref<Array<HTMLLIElement>>([]);

onMounted(() => {
    emitter.on('openSearchbox', openSearchbox);
    document.addEventListener('keydown', handleKeyDown)
});

onBeforeUnmount(() => {
    emitter.off('openSearchbox', openSearchbox);
    document.removeEventListener('keydown', handleKeyDown);
});

function openSearchbox() {
    isShowingSearchMenu.value = true;
    
    nextTick(() => {
        queryInputRef.value?.focus();
    });
}

function handleKeyDown(e: KeyboardEvent) {
    if (!isShowingSearchMenu.value) {
        if (e.key === 'k' && e.ctrlKey) {
            e.preventDefault();
            openSearchbox();
        }
    };

    if (e.key === 'Escape') {
        e.preventDefault();
        isShowingSearchMenu.value = false;
    }
}

function openChat(id: number) {
    isShowingSearchMenu.value = false;
    router.push(`/chat/${id}`);
}

function onInputKeyDown(e: KeyboardEvent) {
    let scrollDown = false;

    switch (e.key) {
        case "Enter":
            const selectedChat = filteredChats.value[selectedIndex.value];
            if (!selectedChat) break;

            const selectedChatId = selectedChat.id;
            openChat(selectedChatId);
            // For some reason the view doesn't update when we just use router.push, so this is a workaround.
            emitter.emit('openChat', selectedChatId.toString());
            
            searchQuery.value = '';
            selectedIndex.value = 0;
            
            break;

        case "ArrowUp":
            selectedIndex.value = Math.max(selectedIndex.value - 1, 0); // back 1 index or keep at 0
            scrollDown = true;
            break;

        case "ArrowDown":
            selectedIndex.value = Math.min(selectedIndex.value + 1, filteredChats.value.length - 1); // up 1 index or keep at max
            scrollDown = true;
            break;

        default:
            selectedIndex.value = 0;
            break;
    }

    if (scrollDown) {
        nextTick(() => {
            const selectedItem = queryItemsRef.value[selectedIndex.value];
            if (selectedItem === undefined) return;

            selectedItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
    }
}
</script>

<template>
    <Transition name="open-search">
        <div v-if="isShowingSearchMenu" class="absolute box-border flex items-top pt-16 justify-center top-0 left-0 w-full h-svh bg-black/50 z-99" @click.self="isShowingSearchMenu = false">
            <div class="flex flex-col gap-2 w-[calc(100dvw-1rem)] max-w-xl h-min max-h-2/3 p-2 bg-surface rounded-xl border-border border-2 shadow-md shadow-background-dark">
                <div class="flex flex-row gap-2">
                    <input
                        data-testid="chat-search-input"
                        ref="queryInputRef" 
                        @keydown="onInputKeyDown" 
                        type="text" 
                        placeholder="Search chats…" 
                        v-model="searchQuery" 
                        class="p-3 w-full outline-none border-border rounded-lg focus:border-border-muted border-2">
                    
                    <input type="checkbox" id="toggle-search-filters" v-model="isShowingFiltersMenu" class="sr-only">
                    <label for="toggle-search-filters" class="aspect-square bg-primary text-background hover:bg-border p-2 flex items-center justify-center rounded-lg cursor-pointer"
                        :class="{ 'hover:bg-border! text-text-muted bg-border-muted!': isShowingFiltersMenu }">
                            <BiFilterAlt class="mr-0.5" />
                    </label>
                </div>
                <div v-if="isShowingFiltersMenu" class="flex flex-row items-center gap-2 pt-5 pb-6 overflow-x-auto">
                    <label for="search-sort-type" class="text-text font-semibold">By:</label>
                    <select id="search-sort-type" v-model="sortType" class="bg-surface-light p-2 border-2 border-border-muted rounded-lg">
                        <option value="latest-activity">Latest activity (default)</option>
                        <option value="created">Creation date</option>
                        <option value="alphabetically">Alphabetically</option>
                    </select>

                    <label for="search-sort-direction" class="text-text font-semibold">Direction:</label>
                    <select id="search-sort-direction" v-model="reverseSort" class="bg-surface-light p-2 border-2 border-border-muted rounded-lg">
                        <option :value="false">Forwards</option>
                        <option :value="true">Reverse</option>
                    </select>

                    <label for="search-userFilter" class="text-text font-semibold">Filter:</label>
                    <select id="search-user-filter" v-model="userFilter" class="bg-surface-light p-2 border-2 border-border-muted rounded-lg">
                        <option value="all">All</option>
                        <option value="pinned">Pinned</option>
                        <option value="unpinned">Unpinned</option>
                    </select>
                </div>
                <ul v-if="filteredChats.length > 0" class="overflow-y-auto flex flex-col gap-2">
                    <li 
                        v-for="(chat, index) in filteredChats"
                        ref="queryItemsRef"
                        @mouseover="selectedIndex = index"
                    >
                        <RouterLink @click.prevent="openChat(chat.id)" 
                            class="flex flex-col p-2 rounded-lg hover:bg-surface-light! cursor-pointer group" 
                            :to="`/chat/${chat.id}`"
                            :class="{ 'bg-surface-light!': selectedIndex === index }"
                        >
                            <span class="font-semibold group-hover:text-text">{{ chat.title }}</span>
                            <span class="text-sm inline-flex items-center">
                                <BiTimeFive class="size-4 mr-1" /> {{ chat.lastestMessageDate?.toLocaleDateString() }}&nbsp;•&nbsp;
                                <PiSparkleFill class="size-4 mr-1" /> {{ chat.createdAt.toLocaleDateString() }}
                            </span>
                        </RouterLink>
                    </li>
                </ul>
                <div v-else class="p-4 flex items-center justify-center">
                    No results.
                </div>
            </div>
        </div>
    </Transition>
</template>