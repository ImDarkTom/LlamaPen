<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'vue-icons-plus/tb';
import SidebarHeader from './SidebarHeader.vue';
import SidebarOptions from './footer/SidebarFooter.vue';
import { useConfigStore } from '../../stores/config';
import { useUiStore } from '../../stores/uiStore';
import ChatList from './ChatList.vue';
import TextpadList from './TextpadList.vue';
import { emitter } from '@/mitt';

const uiStore = useUiStore();

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

function setSidebar(value: boolean) {
    showSidebar.value = value;
    localStorage.setItem('showSidebar', String(value));
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
    <div class="relative">
        <Transition name="slide-left" mode="default">
            <div v-if="showSidebar" class="flex flex-col h-full w-[calc(100vw-3rem)] sm:w-[calc(100vw-3rem)] md:w-[18vw] md:min-w-64 bg-primary-400 box-border p-2 shadow-lg shadow-black">
                <SidebarHeader />

                <Transition name="slide-left" mode="out-in">
                    <!-- Chats List -->
                    <ChatList v-if="uiStore.mode === 'chat'" />
                    <!-- Textpads List -->
                    <TextpadList v-else />
                </Transition>

                <SidebarOptions />
            </div>
            <div v-else></div>  
            <!-- ^This has to be here otherwise it just applies a hidden class to the sidebar causing the transition to not play -->
        </Transition>
        <div class="absolute top-0 right-0 transform translate-x-full h-12 w-12 p-1">
            <div class="h-10 w-10 p-1 cursor-pointer rounded-lg hover:bg-primary-300 hover:shadow-md shadow-black/50 transition-all duration-100"
                @pointerdown="handlePointerDown" aria-label="Toggle Sidebar" :aria-expanded="showSidebar">
                <TbLayoutSidebarLeftCollapse class="size-full" v-if="showSidebar" />
                <TbLayoutSidebarLeftExpand class="size-full" v-else />
            </div>
        </div>
    </div>
</template>