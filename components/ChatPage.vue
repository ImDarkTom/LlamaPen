<script setup lang="ts">
const props = defineProps<{
    id: number | null;
}>();

const chatsStore = useChatsStore();

onMounted(() => {
    chatsStore.openedChatId = props.id;
});
</script>

<template>
    <div class="flex flex-col h-full">
        <ChatMessageList />
        <div class="w-full flex items-center justify-center p-2">
            <ChatMessageInput :chat-id="id" />
        </div>
    </div>
</template>
