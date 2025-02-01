<script setup lang="ts">
import { useAllChatsStore } from '../../stores/allChats';
import { useRouter } from 'vue-router';
import SidebarEntry from './SidebarEntry.vue';
import { IpWrite } from 'vue-icons-plus/ip';
import { AiOutlineSearch } from 'vue-icons-plus/ai';
import { ref } from 'vue';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'vue-icons-plus/tb';

const router = useRouter();

const allChats = useAllChatsStore();
allChats.loadChats();

const newChat = () => {
    router.push('/');
}

function search() {
    alert('to be added...');
}

const showSidebar = ref<boolean>(true);

</script>

<template>
    <div v-if="showSidebar" class="sidebar">
        <div class="header">
            <span class="branding">LlamaPen</span>
            <AiOutlineSearch class="search right-icon" @click="search" />
            <IpWrite class="new-chat right-icon" @click="newChat()" />
        </div>
        <ul>
            <SidebarEntry v-for="chat of allChats.chats" :chat="chat" />
        </ul>
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
    height: 100vh;
    min-width: $sidebar-width;
    background-color: var(--bg-2);
    justify-content: center;
    align-items: center;
    
    .header {
        display: flex;
        flex-direction: row;
        padding: 0.5rem;
        box-sizing: border-box;

        .branding {
            flex: 1;
            font-size: 1.5rem;
        }

        .right-icon {
            height: 1.65rem;
            margin: auto;
            width: auto;
            cursor: pointer;
            margin-left: 1ch;
            padding: 0.35rem;
            box-sizing: content-box;
            border-radius: 0.5rem;

            &:hover {
                background-color: var(--bg-3);
                @include mixin.shadow-low;
            }
        }
    }
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
</style>
