<script setup lang="ts">
import { marked } from 'marked';

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

const props = defineProps<{
    message: OllamaMessage;
}>();

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
            return `
            <div class="thought-text-container">
                <blockquote class="thought-text">\n${token.text}\n</blockquote>
            </div>`;
        }
    }]
});
</script>

<template>
    <div class="chat-message" :class="{ 'bubble': message.role === 'user', 'full': message.role === 'assistant' }">
        <span class="message-creator">{{ props.message.role }}</span>
        <span v-html="marked(props.message.content)" class="message-text"></span>
    </div>
</template>

<style lang="scss">
.chat-message {
    color: var(--txt-1);
    box-sizing: border-box;
    padding: 1rem;
    margin: 1rem;
    display: flex;
    flex-direction: column;

    .message-creator {
        font-weight: bold;
        text-transform: capitalize;
        padding-bottom: 0.8rem;
        font-size: 1.2rem;
    }

    .message-text {
        p {
            padding-bottom: 0.5rem;
        }
    }
}

.chat-message.bubble {
    margin-left: auto;
    border-radius: 1rem;
    background-color: var(--bg-3);
    width: clamp(350px, 50%, 1280px);
    box-shadow: 0px 3px 10px -3px black;
}

.chat-message.full {
    width: 100%;
    box-sizing: border-box;
    margin: 0;

    .message-creator {
        display: none;
    }
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
    margin-bottom: 1rem;

    .thought-header {
        font-weight: bold;
        padding: 0.5rem 0;
        font-style: normal;
        filter: none;
    }
}
</style>
