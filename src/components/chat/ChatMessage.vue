<script setup lang="ts">
import MessageOptions from './MessageOptions.vue';
import { nextTick, ref } from 'vue';

import { Marked } from 'marked';

import "katex/dist/katex.min.css";
import markedKatex from 'marked-katex-extension';

import { markedHighlight } from 'marked-highlight';
import "highlight.js/styles/monokai.min.css"
import hljs from 'highlight.js';
import MessageEditor from './MessageEditor.vue';
import { useAllChatsStore } from '../../stores/allChats';
import { useConfigStore } from '../../stores/config';

const props = defineProps<{
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

const allChats = useAllChatsStore();
const config = useConfigStore();

const editing = ref<boolean>(false);
const messageEditorRef = ref<InstanceType<typeof MessageEditor> | null>(null);

function editMessage() {
    editing.value = true;

    nextTick(() => {
        messageEditorRef.value?.focusEditor();
    });
}

function cancelEditing() {
    editing.value = false;
}

function finishEdit(newText: string) {
    editing.value = false;

    allChats.editUserSentMessage(props.message.id, newText, {
        requestUrl: config.apiUrl('/api/chat'),
        selectedModel: localStorage.getItem('selectedModel')!
    });
}
</script>

<template>
    <div class="text-txt-1 box-border p-4 m-4 flex flex-col whitespace-pre-wrap" :class="{ 
        'ml-auto rounded-xl bg-primary-300 max-w-[70%] shadow-sm shadow-black': props.message.role === 'user' && !editing, 
        'w-full box-border !p-0 !m-0': props.message.role === 'assistant' || editing 
    }">
        <MessageEditor v-if="editing" 
            ref="messageEditorRef" 
            :messageText="message.content"
            @onCancelEdit="cancelEditing" 
            @onFinishEditing="finishEdit" 
        />

        <template v-else>
            <span v-if="message.role !== 'user'" v-html="marked.parse(message.content)" class="message-text"></span>
            <div v-else class="message-text">{{ message.content }}</div>

            <MessageOptions :message="message" @editMessage="editMessage" />
        </template>
    </div>
</template>

<style>
@reference "@/styles/style.css";

.thought-text-container,
think {
    @apply italic opacity-80 pb-4 flex bg-primary-200 rounded-xl p-2 box-border mb-4;
}

.message-text pre {
    @apply overflow-x-auto mb-4 border border-txt-1/50 rounded-lg;
}
</style>