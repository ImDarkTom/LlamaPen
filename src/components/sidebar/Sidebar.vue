<script setup lang="ts">
import { useAllChatsStore } from '../../stores/allChats';
import SidebarEntry from './SidebarEntry.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'vue-icons-plus/tb';
import SidebarHeader from './SidebarHeader.vue';
import SidebarOptions from './footer/SidebarFooter.vue';
import { useConfigStore } from '../../stores/config';

const allChats = useAllChatsStore();
allChats.loadChats();

const useConfig = useConfigStore();
const showSidebar = ref<boolean>(useConfig.showSidebar);

function handlePointerDown(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }

    toggleSidebar();
}

const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;
    localStorage.setItem('showSidebar', String(showSidebar.value))
}

function shortcutListener(e: KeyboardEvent) {
    if (e.key === "S" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        toggleSidebar();
    }
}

onMounted(() => {
    document.addEventListener('keydown', shortcutListener);
});

onUnmounted(() => {
    document.removeEventListener('keydown', shortcutListener);
});

const pinnedChats = computed<Chat[]>(() => {
    return allChats.chats.filter((chat) => (chat.pinned || false)).sort((a, b) => (b.lastMessage ?? 0) - (a.lastMessage ?? 0));
});

const hasPinnedChats = computed<boolean>(() => {
    return pinnedChats.value.length !== 0;
})

const unpinnedChats = computed<Chat[]>(() => {
    return allChats.chats.filter((chat) => !(chat.pinned || false)).sort((a, b) => (b.lastMessage ?? 0) - (a.lastMessage ?? 0));
})
</script>

<template>
    <div class="relative">
        <div class="flex flex-col h-full w-[calc(100vw-3rem)] sm:w-[calc(100vw-3rem)] md:w-[18vw] md:min-w-64 bg-primary-400 box-border p-2" :class="{ 'hidden': !showSidebar }">
            <SidebarHeader />

            <!-- Chats List -->
            <div class="p-0 m-0 flex-1 overflow-y-auto">
                <div class="p-0 m-0 flex-1" role="list" aria-labelledby="pinnedChatsSection">
                    <h3 id="pinnedChatsSection" class="sr-only">Pinned Chats</h3>
                    <SidebarEntry v-for="chat of pinnedChats" :key="chat.id" :chat="chat" />
                </div>

                <div v-if="hasPinnedChats" class="w-full h-[1px] bg-txt-1/50" role="separator"></div>

                <div class="p-0 m-0 flex-1" role="list" aria-labelledby="unpinnedChatsSection">
                    <h3 id="unpinnedChatsSection" class="sr-only">Unpinned Chats</h3>
                    <SidebarEntry v-for="chat of unpinnedChats" :key="chat.id" :chat="chat" />
                </div>
            </div>
            <SidebarOptions />
        </div>
        <div class="absolute top-0 right-0 transform translate-x-full h-12 w-12 p-1">
            <div class="h-10 w-10 p-1 cursor-pointer rounded-lg hover:bg-primary-300" 
                @pointerdown="handlePointerDown"
                aria-label="Toggle Sidebar"
                :aria-expanded="showSidebar"
            >
                <TbLayoutSidebarLeftCollapse class="size-full" v-if="showSidebar"/>
                <TbLayoutSidebarLeftExpand class="size-full" v-else />
            </div>
        </div>
    </div>
</template>