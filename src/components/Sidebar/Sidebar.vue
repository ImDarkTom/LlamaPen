<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { TbLayoutSidebarFilled } from 'vue-icons-plus/tb';
import SidebarHeader from './SidebarHeader.vue';
import SidebarOptions from './footer/SidebarFooter.vue';
import { useConfigStore } from '../../stores/config';
import { useUiStore } from '../../stores/uiStore';
import ChatList from './ChatList.vue';
import NoteList from './NoteList.vue';
import { emitter } from '@/mitt';

const uiStore = useUiStore();

const useConfig = useConfigStore();

function handlePointerDown(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }

    toggleSidebar();
}

const toggleSidebar = () => {
    useConfig.showSidebar = !useConfig.showSidebar;
}

function setSidebar(value: boolean) {
    useConfig.showSidebar = value;
}

function shortcutListener(e: KeyboardEvent) {
    if (e.key === "S" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        toggleSidebar();
    }
}

onMounted(() => {
    emitter.on('hideSidebar', () => setSidebar(false));
    document.addEventListener('keydown', shortcutListener);
});

onUnmounted(() => {
    emitter.off('hideSidebar', () => setSidebar(false));
    document.removeEventListener('keydown', shortcutListener);
});
</script>

<template>
    <div class="">
        <Transition name="slide-left" mode="default">
            <div v-show="useConfig.showSidebar" class="flex flex-col h-full w-[calc(100vw-3rem)] sm:w-[calc(100vw-3rem)] md:w-[18vw] md:min-w-64 bg-primary-500 box-border p-2">
                <SidebarHeader />

                <Transition name="slide-left" mode="out-in">
                    <!-- Chats List -->
                    <ChatList v-if="uiStore.mode === 'chat'" />
                    <!-- Textpads List -->
                    <NoteList v-else />
                </Transition>
                <SidebarOptions />
            </div>
        </Transition>
        <div class="absolute top-0 left-0 h-12 w-12 p-2 z-30">
            <div class="h-10 w-10 p-1.5 cursor-pointer rounded-lg hover:bg-primary-300 hover:shadow-md shadow-black/50 transition-all duration-100"
                @pointerdown="handlePointerDown" aria-label="Toggle Sidebar">
                <TbLayoutSidebarFilled class="size-full hover:brightness-75 hover:scale-90 active:scale-110 transition-all duration-100" />
            </div>
        </div>
    </div>
</template>