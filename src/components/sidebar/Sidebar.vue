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
</template>

<style scoped lang="scss">
$sidebar-width: 16vw;

.sidebar-toggle {
    position: absolute;
    top: 0;
    left: 0;
    height: 2.5rem;
    width: 2.5rem;
    padding: 0.25rem;
    margin: 0.25rem;
    cursor: pointer;
    border-radius: 0.5rem;

    &.sidebar-open {
        left: $sidebar-width;
    }

    &:hover {
        background-color: var(--bg-3)
    }

    * {
        width: 100%;
        height: 100%;
    }

}

.sidebar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-width: $sidebar-width;
    background-color: var(--bg-2);

    .sidebar-chats {
        list-style: none;
        padding: 0;
        margin: 0;
        flex: 1;
    }
}
</style>
