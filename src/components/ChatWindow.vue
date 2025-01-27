<script setup lang="ts">
import StatusText from './StatusText.vue';
import MessageInput from './MessageInput.vue';
import { computed, ref } from 'vue';

const messageInputRef = ref<InstanceType<typeof MessageInput> | null>(null);

// const mockMessages = [
//     {
//         role: 'user',
//         content: 'what is 2 + 2?'
//     },
//     {
//         role: 'assistant',
//         content: 'The answer is 4.'
//     }
// ];

const chatMessages = computed(() => {
    return messageInputRef.value?.chatMessages || [];
});

</script>

<template>
    <div class="chat-window">
        <div class="ollama-status-text">
            <StatusText />
        </div>
        <div class="message-list">
            <div v-for="message of chatMessages" class="chat-message" :class="{ 'user': message.role === 'user' }">
                <span class="message-creator">{{ message.role }}</span>
                <span>{{ message.content }}</span>
            </div>
        </div>
        <div class="message-input-container">
            <MessageInput ref="messageInputRef" />
        </div>
    </div>
</template>

<style scoped>
.message-input-container {
    display: flex;
}

.chat-window {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.message-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
}

.chat-message {
    background-color: darkgrey;
    box-sizing: border-box;
    padding: 1rem;
    margin: 1rem;
    width: 50%;
    display: flex;
    flex-direction: column;
    border-radius: 1rem 1rem 1rem 0.05rem;
}

.chat-message.user {
    margin-left: auto;
    border-radius: 1rem 1rem 0.05rem 1rem;
}

.message-creator {
    font-weight: bold;
    text-transform: capitalize;
    padding-bottom: 0.8rem;
    font-size: 1.2rem;
}
</style>
