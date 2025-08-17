<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { TbLayoutSidebarFilled } from 'vue-icons-plus/tb';
import SidebarHeader from './SidebarHeader.vue';
import SidebarFooter from './footer/SidebarFooter.vue';
import { useConfigStore } from '../../stores/config';
import { emitter } from '@/lib/mitt';
import ChatList from './ChatList.vue';

const useConfig = useConfigStore();

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
    if (e.key === "S" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        toggleSidebar();
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
</script>

<template>
    <!-- note: removing the wrapper breaks this -->
    <div>
        <aside 
            class="flex flex-col fixed top-0 left-0 h-full w-72 z-[29] bg-background-dark box-border p-2 transition-all duration-dynamic"
            :class="{ '-translate-x-full': !useConfig.showSidebar, 'translate-x-0': useConfig.showSidebar }"
        >
            <SidebarHeader />
            <ChatList />
            <SidebarFooter />
        </aside>
        <div class="absolute top-0 left-0 h-12 w-12 p-2 z-30">
            <div class="size-10 p-1.5 cursor-pointer rounded-lg text-text hover:bg-surface hover:shadow-md shadow-background-dark transition-all duration-dynamic"
                @pointerdown="handlePointerDown" aria-label="Toggle Sidebar">
                <TbLayoutSidebarFilled class="size-full" />
            </div>
        </div>
    </div>
</template>