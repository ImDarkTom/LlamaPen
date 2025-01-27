<script setup lang="ts">
import StatusText from './StatusText.vue';
import MessageInput from './MessageInput.vue';
import { computed, ref } from 'vue';
import { marked } from 'marked';
import TopBar from './TopBar.vue';
import ModelSelect from './ModelSelect.vue';


marked.use({
    extensions: [{
        name: 'thinkBlock',
        level: 'block',
        start(src) { return src.match(/<think>/i)?.index; },
        tokenizer(src) {
            const rule = /^<think>([\s\S]*?)<\/think>/i;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: 'thinkBlock',
                    raw: match[0],
                    text: match[1].trim()
                };
            }
        },
        renderer(token) {
            return `<div class="thought-text-container"><blockquote class="thought-text">\n${token.text}\n</blockquote></div>`;
        }
    }]
});

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
        <TopBar>
            <template #left>
                <StatusText />
            </template>
            <template #right>
                <ModelSelect />
            </template>
        </TopBar>
        <div class="message-list">
            <div v-for="message of chatMessages" class="chat-message" :class="{ 'user': message.role === 'user' }">
                <span class="message-creator">{{ message.role }}</span>
                <span v-html="marked(message.content)" class="message-text"></span>
            </div>
        </div>
        <div class="message-input-container">
            <MessageInput ref="messageInputRef" />
        </div>
    </div>
</template>

<style>
.message-text p {
    padding-bottom: 0.5rem;
}

.thought-text-container,
think {
    font-style: italic;
    filter: opacity(0.8);
    padding-bottom: 1rem;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-3);
    border-radius: 1rem;
    padding: 0.5rem;
    box-sizing: border-box;
}

.thought-header {
    font-weight: bold;
    padding: 0.5rem 0;
    font-style: normal;
    filter: none;
}
</style>

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
    background-color: var(--bg-2);
    color: var(--txt-1);
    box-sizing: border-box;
    padding: 1rem;
    margin: 1rem;
    width: clamp(350px, 50%, 1280px);
    display: flex;
    flex-direction: column;
    border-radius: 1rem 1rem 1rem 0.05rem;
}

.chat-message.user {
    margin-left: auto;
    border-radius: 1rem 1rem 0.05rem 1rem;
    background-color: var(--bg-3);
}

.message-creator {
    font-weight: bold;
    text-transform: capitalize;
    padding-bottom: 0.8rem;
    font-size: 1.2rem;
}
</style>
