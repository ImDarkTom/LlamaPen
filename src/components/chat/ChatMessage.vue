<script setup lang="ts">
import MessageOptions from './MessageOptions.vue';
import { defineProps } from 'vue';

import { Marked } from 'marked';

import "katex/dist/katex.min.css";
import markedKatex from 'marked-katex-extension';

import { markedHighlight } from 'marked-highlight';
import "highlight.js/styles/monokai.min.css"
import hljs from 'highlight.js';

defineProps<{
    message: AppMessage;
}>();

const marked = new Marked();

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

marked.use(markedKatex());

marked.use(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';

        return hljs.highlight(code, { language }).value;
    }
}));
</script>

<template>
    <div class="chat-message" :class="{ 'bubble': message.role === 'user', 'full': message.role === 'assistant' }">
        <!-- <span class="message-creator">{{ message.role }}</span> -->

        <span v-if="message.role !== 'user'" v-html="marked.parse(message.content)" class="message-text"></span>
        <div v-else class="message-text">{{ message.content }}</div>

        <MessageOptions :message="message" />
    </div>
</template>

<style lang="scss">
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

<style scoped lang="scss">
.chat-message {
    color: var(--txt-1);
    box-sizing: border-box;
    padding: 1rem;
    margin: 1rem;
    display: flex;
    flex-direction: column;
    white-space: pre-wrap;

    &.bubble {
        @include mixin.shadow-medium;

        margin-left: auto;
        border-radius: 1rem;
        background-color: var(--bg-3);
        max-width: 70%;
    }

    &.full {
        width: 100%;
        box-sizing: border-box;
        margin: 0;
    }

    .message-text {
        pre {
            overflow-x: auto;
        }
    }
}
</style>
