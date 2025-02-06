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
    <div class="sidebar-container">
        <div class="sidebar" :class="{ 'hidden': !showSidebar }">
            <SidebarHeader />
            <div class="sidebar-chats">
                <SidebarEntry v-for="chat of allChats.chats" :key="chat.id" :chat="chat" />
            </div>
            <SidebarOptions />
        </div>
        <div class="sidebar-toggle" @pointerdown="toggleSidebar">
            <TbLayoutSidebarLeftCollapse v-if="showSidebar"/>
            <TbLayoutSidebarLeftExpand v-else />
        </div>
    </div>
</template>

<style scoped lang="scss">
.sidebar-container {
    position: relative;

    .sidebar {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 18vw;
        min-width: 260px;
        background-color: var(--bg-2);
        box-sizing: border-box;
        padding: 0.5rem;

        &.hidden {
            display: none;
        }

        .sidebar-chats {
            padding: 0;
            margin: 0;
            flex: 1;
        }
    }

    .sidebar-toggle {
        position: absolute;
        top: 0;
        right: -3rem;
        height: 2.5rem;
        width: 2.5rem;
        padding: 0.25rem;
        margin: 0.25rem;
        cursor: pointer;
        border-radius: 0.5rem;

        &:hover {
            background-color: var(--bg-3)
        }

        * {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
