<script setup lang="ts">
import { useAllChatsStore } from '../stores/allChats';
import { useRouter } from 'vue-router';
import { v4 as randomUUID } from 'uuid';
import SidebarEntry from './SidebarEntry.vue';

const router = useRouter();

const allChats = useAllChatsStore();
allChats.loadChats();

const newChat = () => {
    const uuid = randomUUID();
    allChats.createChat(uuid);

    router.push(`/chat/${uuid}`);
}


</script>

<template>
    <div class="sidebar">
        <div @click="newChat()">New Chat</div>
        <ul>
            <SidebarEntry v-for="chat of allChats.chats" :chat="chat"/>
        </ul>
    </div>
</template>

<style scoped>
.sidebar {
    height: 100vh;
    width: 20vw;
    min-width: 20vw;
    background-color: var(--bg-2);
    border-radius: 0 1rem 1rem 0;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
</style>
