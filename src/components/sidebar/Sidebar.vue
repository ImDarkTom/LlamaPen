<script setup lang="ts">
import { useAllChatsStore } from '../../stores/allChats';
import SidebarEntry from './SidebarEntry.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'vue-icons-plus/tb';
import SidebarHeader from './SidebarHeader.vue';
import SidebarOptions from './footer/SidebarFooter.vue';
import { useConfigStore } from '../../stores/config';

const allChats = useAllChatsStore();
allChats.loadChats();

const useConfig = useConfigStore();
const showSidebar = ref<boolean>(useConfig.showSidebar);

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
</script>

<template>
    <div class="relative">
        <div class="flex flex-col h-full w-[18vw] min-w-64 bg-primary-400 box-border p-2" :class="{ 'hidden': !showSidebar }">
            <SidebarHeader />
            <div class="p-0 m-0 flex-1">
                <SidebarEntry v-for="chat of allChats.chats.filter((chat) => (chat.pinned || false)).sort((a, b) => (b.lastMessage ?? 0) - (a.lastMessage ?? 0))" :key="chat.id" :chat="chat" />
                <!-- <div class="w-full h-[1px] bg-txt-1/50" role="separator"></div> -->
                <SidebarEntry v-for="chat of allChats.chats.filter((chat) => !(chat.pinned || false)).sort((a, b) => (b.lastMessage ?? 0) - (a.lastMessage ?? 0))" :key="chat.id" :chat="chat" />
            </div>
            <SidebarOptions />
        </div>
        <div class="absolute top-0 right-0 transform translate-x-full h-12 w-12 p-1">
            <div class="h-10 w-10 p-1 cursor-pointer rounded-lg hover:bg-primary-300" @pointerdown="toggleSidebar">
                <TbLayoutSidebarLeftCollapse class="size-full" v-if="showSidebar"/>
                <TbLayoutSidebarLeftExpand class="size-full" v-else />
            </div>
        </div>
    </div>
</template>