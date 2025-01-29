<script setup lang="ts">
import StatusText from './StatusText.vue';
import MessageInput from './MessageInput.vue';
import { computed, ref } from 'vue';
import TopBar from './TopBar.vue';
import ModelSelect from './ModelSelect.vue';
import CustomUrlButton from './CustomUrlButton.vue';
import ChatMessages from './ChatMessages.vue';

const messageInputRef = ref<InstanceType<typeof MessageInput> | null>(null);

const chatMessages = computed(() => {
    return messageInputRef.value?.chatMessages || [];
});
</script>

<template>
    <div class="chat-window">
        <TopBar>
            <template #left>
                <StatusText />
            </template>
            <template #right>
                <CustomUrlButton />
                <ModelSelect />
            </template>
        </TopBar>
        <ChatMessages :chatMessages="chatMessages" />
        <MessageInput ref="messageInputRef" />
    </div>
</template>

<style scoped>
.chat-window {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
