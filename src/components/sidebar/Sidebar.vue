<script setup lang="ts">
import { useAllChatsStore } from '../../stores/allChats';
import { useRouter } from 'vue-router';
import SidebarEntry from './SidebarEntry.vue';
import { IpWrite } from 'vue-icons-plus/ip';
import { AiOutlineSearch } from 'vue-icons-plus/ai';

const router = useRouter();

const allChats = useAllChatsStore();
allChats.loadChats();

const newChat = () => {
    router.push('/');
}

function search() {
    alert('to be added...');
}

</script>

<template>
    <div class="sidebar">
        <div class="header">
            <span class="branding">LlamaPen</span>
            <AiOutlineSearch class="search right-icon" @click="search" />
            <IpWrite class="new-chat right-icon" @click="newChat()" />
        </div>
        <ul>
            <SidebarEntry v-for="chat of allChats.chats" :chat="chat"/>
        </ul>
    </div>
</template>

<style scoped lang="scss">
.sidebar {
    height: 100vh;
    width: 20vw;
    min-width: 20vw;
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
