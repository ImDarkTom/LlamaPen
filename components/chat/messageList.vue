<script setup lang="ts">
const chatsStore = useChatsStore();
</script>

<template>
    <div class="overflow-y-auto grow">
        <ul class="mx-auto w-3xl pt-4 grow">
            <li
                v-for="message in chatsStore.openedChatMessages"
                :key="message.id"
                class="w-full"
            >
                <ChatMessage :message />
            </li>
        </ul>
    </div>
</template>
