<script setup lang="ts">
const chatsStore = useChatsStore();
</script>

<template>
    <div class="overflow-y-auto">
        <ul class="mx-auto w-3xl pt-4 grow">
            <li
                v-for="message in chatsStore.openedChatMessages"
                :key="message.id"
                class="w-full"
            >
                <ChatMessage :message />
            </li>
            <li
                v-for="i in 100"
                :key="i"
            >
                <ChatMessage
                    :message="{
                        chatId: 1,
                        content: 'sample text',
                        createdAt: new Date().getTime(),
                        id: 4,
                        role: 'assistant',
                    }"
                />
            </li>
        </ul>
    </div>
</template>
