<script setup lang="ts">
import { useAllChatsStore } from '../../stores/allChats';
import SidebarEntry from './SidebarEntry.vue';
import { ref } from 'vue';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'vue-icons-plus/tb';
import SidebarHeader from './SidebarHeader.vue';
import SidebarOptions from './SidebarOptions.vue';

const allChats = useAllChatsStore();
allChats.loadChats();

const showSidebar = ref<boolean>(true);

</script>

<template>
    <div class="sidebar-container">
        <div v-if="showSidebar" class="sidebar">
            <SidebarHeader />
            <ul class="sidebar-chats">
                <SidebarEntry v-for="chat of allChats.chats" :chat="chat" />
            </ul>
            <SidebarOptions />
        </div>
        <div class="sidebar-toggle" :class="{'sidebar-open': showSidebar}">
            <TbLayoutSidebarLeftCollapse v-if="showSidebar" @click="showSidebar = false"/>
            <TbLayoutSidebarLeftExpand v-else @click="showSidebar = true" />
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
        background-color: var(--bg-2);
        box-sizing: border-box;
        padding: 0.5rem;

        .sidebar-chats {
            list-style: none;
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
