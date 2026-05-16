<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { TbLayoutSidebarFilled } from 'vue-icons-plus/tb';
import { useConfigStore } from '../../stores/config';
import { emitter } from '@/lib/mitt';
import useMessagesStore from '@/stores/messagesStore';
import useChatsStore from '@/stores/chatsStore';
import useSidebarStore from '@/stores/useSidebarStore';
import { storeToRefs } from 'pinia';

const useConfig = useConfigStore();
const messagesStore = useMessagesStore();
const chatsStore = useChatsStore();

const toggleSidebar = () => {
    useConfig.showSidebar = !useConfig.showSidebar;
}

function handlePointerDown(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }

    toggleSidebar();
}

function shortcutListener(e: KeyboardEvent) {
    if (e.key === 'S' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        toggleSidebar();
    } else if (e.key === 'P' && e.shiftKey && e.altKey) {
        e.preventDefault();
        const openedChatId = messagesStore.openedChatId;
        if (!openedChatId) return;

        const isPinned = chatsStore.pinnedChats.some(c => c.id === openedChatId);
        chatsStore.setPinned(openedChatId, !isPinned);
    }
}

function hideSidebar() {
    useConfig.showSidebar = false;
}

onMounted(() => {
    emitter.on('hideSidebar', hideSidebar);
    document.addEventListener('keydown', shortcutListener);
});

onUnmounted(() => {
    emitter.off('hideSidebar', hideSidebar);
    document.removeEventListener('keydown', shortcutListener);
});

const sidebarState = useSidebarStore();
const { sidebarMode } = storeToRefs(sidebarState);
</script>

<template>
    <!-- note: removing the wrapper breaks this -->
    <div class="flex">
        <aside 
            class="flex flex-col fixed top-0 left-0 h-full w-72 z-29 bg-base-950 box-border transition-all duration-dynamic overflow-hidden"
            :class="{ 
                '-translate-x-full': !useConfig.showSidebar, 
                'translate-x-0': useConfig.showSidebar
            }" >
            <Transition name="sidebar-switch" mode="out-in">
                <SidebarStateChats v-if="sidebarMode == 'chats'" />
                <SidebarStateModels v-else-if="sidebarMode === 'models'" />
            </Transition>
        </aside>
        <div class="absolute top-0 left-0 h-12 w-12 p-2 z-30">
            <Tooltip 
                text="Toggle Sidebar" 
                size="tiny"
                :kbd-shortcut="{
                    key: 's',
                    ctrl: true,
                    shift: true,
                }">
                <div 
                    class="size-10 p-1.5 cursor-pointer rounded-lg text-base-100 hover:bg-base-700 hover:shadow-md shadow-base-950 transition-all duration-dynamic"
                    :class="{ 'bg-base-800': !useConfig.showSidebar }"
                    @pointerdown="handlePointerDown" 
                    aria-label="Toggle Sidebar" >
                    <TbLayoutSidebarFilled class="size-full" />
                </div>
            </Tooltip>
        </div>
    </div>
</template>