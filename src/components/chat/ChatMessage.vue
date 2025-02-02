<script setup lang="ts">
import { marked } from 'marked';
import { BsCopy, BsPen } from 'vue-icons-plus/bs';
import TooltipBottom from '../TooltipBottom.vue';
import { ref, defineProps } from 'vue';

const props = defineProps<{
    message: AppMessage;
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

function copyMessage(message: OllamaMessage) {
    const tempElem = document.createElement('input');
    tempElem.value = message.content;

    tempElem.select();
    tempElem.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(tempElem.value);

    copyTooltipText.value = "Copied!";

    setTimeout(() => {
        copyTooltipText.value = "Copy text";
    }, 1000);
}

const copyTooltipText = ref<string>("Copy text");
function editMessage(_message: OllamaMessage) {
    // const messageText = message.content;
    // const messageIndex = chatStore.messages.findIndex((storedMessage) => storedMessage === message);

    // chatStore.messages.splice(messageIndex);

    console.log("to be added");
}

</script>

<template>
    <div class="chat-message" :class="{ 'bubble': props.message.role === 'user', 'full': props.message.role === 'assistant' }">
        <span class="message-creator">{{ props.message.role }}</span>

        <span v-if="props.message.role !== 'user'" v-html="marked(props.message.content)" class="message-text"></span>
        <span v-else v-html="props.message.content" class="message-text"></span>

        <div class="message-options">
            <TooltipBottom v-if="props.message.role !== 'user'" :text="copyTooltipText" >
                <BsCopy title="Copy Text" @click="copyMessage(props.message)" />
            </TooltipBottom>
            <TooltipBottom v-else text="Edit" >
                <BsPen title="Edit" @click="editMessage(props.message)" />
            </TooltipBottom>
        </div>
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
    
    &.bubble {
        @include mixin.shadow-medium;
        
        margin-left: auto;
        border-radius: 1rem;
        background-color: var(--bg-3);
        width: clamp(350px, 50%, 1280px);
    }

    &.full {
        width: 100%;
        box-sizing: border-box;
        margin: 0;

        .message-creator {
            display: none;
        }
    }

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

        pre {
            overflow-x: auto;
            background-color: rgba($color: #000000, $alpha: 0.5);
            box-sizing: border-box;
            padding: 0.5rem;
        }
    }

    .message-options {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        padding-top: 1rem;

        > * {
            box-sizing: content-box;
            padding: 0.5rem;
            border-radius: 0.5rem;
            cursor: pointer;

            &:hover {
                @include mixin.shadow-low;

                background-color: var(--bg-2);
            }
        }
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
