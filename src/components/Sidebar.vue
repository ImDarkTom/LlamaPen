<script setup lang="ts">
import { useAllChatsStore } from '../stores/allChats';
import { useRouter } from 'vue-router';
import { v4 as randomUUID } from 'uuid';

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
            <li v-for="chat of allChats.chats">
                <router-link :to="`/chat/${chat.id}`">{{ chat.label }}</router-link>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.sidebar {
    height: 100vh;
    width: 20vw;
    background-color: var(--bg-2);
    border-radius: 0 1rem 1rem 0;
}
</style>
