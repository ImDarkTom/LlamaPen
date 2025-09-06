<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

import { emitter } from '@/lib/mitt';
import useMessagesStore from '@/stores/messagesStore';

import { nanoid } from 'nanoid';
import { renderMarkdown } from '@/lib/marked';
import { getMessageAttachmentBlobs } from '@/utils/core/getMessageAttachments';
import ThinkBlock from './ThinkBlock.vue';
import MessageInteractions from './MessageInteractions.vue';
import MessageEditor from '../MessageEditor.vue';
import ModelMessageHeader from './ModelMessage/ModelMessageHeader.vue';

const messagesStore = useMessagesStore();

const props = defineProps<{
    message: ChatMessage;
}>();

const images = ref<{ id: string; blobSrc: string; file: Blob }[]>([]);
onMounted(async () => {
    const messageAttachments = await getMessageAttachmentBlobs(props.message.id);
    images.value = messageAttachments.map((attachment) => {
        return {
            id: nanoid(),
            blobSrc: URL.createObjectURL(attachment),
            file: attachment,
        }
    });
})

// === State ===
const editing = ref<boolean>(false);
const messageEditorRef = ref<InstanceType<typeof MessageEditor> | null>(null);

// === Computed ===
const isUserMessage = computed(() => props.message.type === 'user');
const isModelMessage = computed(() => props.message.type === 'model');
const modelMessageDone = computed(() => props.message.type === 'model' &&
    (props.message.status === 'finished' || props.message.status === 'cancelled')
);

// === Functions ===

// Editing
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

    console.log(props.message.type);
    messagesStore.editMessage(props.message.id, newText, props.message.type === 'user');
}

// Rendering
function renderText(text: string) {
    if (!text.startsWith('<think>')) {
        return renderMarkdown(text);
    }

    const afterThinkRegex = /(?<=<\/think>)([\s\S]*)/i;;
    const allAfterThinkBlock = afterThinkRegex.exec(text)?.[1] || '';

    return renderMarkdown(allAfterThinkBlock);
}

</script>

<template>
    <div class="group/message m-2 mb-0 flex flex-col">
        <div class="box-border p-4 flex flex-col" :class="{
            'ml-auto rounded-2xl bg-background-light max-w-[70%] shadow-md shadow-background-dark/50': isUserMessage && !editing,
            'w-full max-w-[calc(100dvw-1rem)] box-border !p-2 !pb-1 !m-0': isModelMessage || editing
        }">
            <ModelMessageHeader v-if="message.type === 'model'" :message :modelMessageDone />
            <img 
                v-for="image of images" 
                :key="image.id" 
                :src="image.blobSrc"
                class="rounded-xl max-w-64 max-h-full cursor-pointer mb-2"
                @click="emitter.emit('openLightbox', { image: image.file })" alt="Message attached media" />

            <MessageEditor 
                v-if="editing" 
                ref="messageEditorRef" 
                :message
                @onCancelEdit="cancelEditing" 
                @onFinishEditing="finishEdit" />

            <div class="relative" v-else>
                <article 
                    v-if="message.type === 'user'" 
                    class="max-w-none prose prose-app! dark:prose-invert" >
                    {{ message.content }}
                </article>
                <div 
                    v-else-if="message.type === 'model'" >
                    <ThinkBlock :message="(message as ModelChatMessage)" />
                    <article class="max-w-none prose prose-app! dark:prose-invert" v-html="renderText(message.content)"></article>
                    <div
                        v-if="message.status === 'waiting' || message.status === 'generating'"
                        class="animate-breathe rounded-full bg-text inline-block"
                        :class="{
                            'size-6': message.status === 'waiting',
                            'size-4': message.status === 'generating',
                        }"></div>
                </div>
            </div>
        </div>
        <MessageInteractions
            class="transition-opacity duration-dynamic hover:duration-0"
            :class="{
                'group-hover/message:opacity-100 md:opacity-0': message.type === 'user'
            }"
            v-if="!editing" 
            :message 
            :done="modelMessageDone" 
            @editMessage="editMessage" />
    </div>
</template>