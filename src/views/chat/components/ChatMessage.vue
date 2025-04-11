<script setup lang="ts">
import MessageOptions from './MessageOptions.vue';
import { nextTick, ref } from 'vue';

import { Marked } from 'marked';

import "katex/dist/katex.min.css";
import markedKatex from 'marked-katex-extension';

import { markedHighlight } from 'marked-highlight';
import "highlight.js/styles/atom-one-dark.min.css";
import hljs from 'highlight.js';
import MessageEditor from './MessageEditor.vue';
import { emitter } from '@/mitt';
import useMessagesStore from '@/stores/messagesStore';

import { nanoid } from 'nanoid';
import ThinkBlock from './ChatMessage/ThinkBlock.vue';

const messagesStore = useMessagesStore();

const props = defineProps<{
    message: ChatMessage;
}>();

const marked = new Marked();

marked.use(markedKatex());

marked.use(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';

        return hljs.highlight(code, { language }).value;
    }
}));

// === Editing ===
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

    messagesStore.editMessage(props.message.id, newText);
}

const images = (props.message.attachments || []).map((file) => {
    return {
        id: nanoid(),
        blobSrc: URL.createObjectURL(file),
        file,
    }
});

function renderText(text: string) {
    if (!text.startsWith('<think>')) {
        return marked.parse(text);
    }

    const afterThinkRegex = /(?<=<\/think>)([\s\S]*)/i;;
    const allAfterThinkBlock = afterThinkRegex.exec(text)?.[1] || '';

    return marked.parse(allAfterThinkBlock);
}
</script>

<template>
    <div class="group m-2 flex flex-col">
        <div class="text-txt-1 box-border p-4 flex flex-col" :class="{
            'ml-auto rounded-2xl bg-primary-300 max-w-[70%] shadow-sm shadow-black/50': props.message.type === 'user' && !editing,
            'w-full box-border !p-2 !m-0': props.message.type === 'model' || editing
        }">
            <img v-for="image of images" :key="image.id" :src="image.blobSrc"
                class="rounded-xl max-w-full max-h-full cursor-pointer mb-2"
                @click="emitter.emit('openLightbox', { image: image.file })" />

            <MessageEditor v-if="editing" ref="messageEditorRef" :messageText="message.content"
                @onCancelEdit="cancelEditing" @onFinishEditing="finishEdit" />

            <div class="relative" v-else>
                <div 
                    v-if="message.type === 'user'" 
                    class="max-w-none prose prose-invert"
                >
                    {{ message.content }}
                </div>
                <span v-else>
                    <ThinkBlock :message="message" />
                    <span 
                        class="max-w-none prose prose-invert inline-block"
                        v-html="renderText(message.content)"
                    >
                    </span>
                    <div v-if="message.status === 'waiting' || message.status === 'generating'"
                        class="animate-breathe rounded-full bg-txt-1 inline-block"
                        :class="{ 
                            'size-6': message.status === 'waiting',
                            'size-4': message.status === 'generating',
                        }"></div>
                </span>
            </div>
        </div>
        <MessageOptions v-if="!editing" class="opacity-100 group-hover:opacity-100" :message="message"
            @editMessage="editMessage" />
    </div>
</template>