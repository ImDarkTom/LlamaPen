<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

import { emitter } from '@/lib/mitt';
import useMessagesStore from '@/stores/messagesStore';

import { nanoid } from 'nanoid';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import { BiTimeFive } from 'vue-icons-plus/bi';
import { renderMarkdown } from '@/lib/marked';
import { getMessageAttachmentBlobs } from '@/utils/core/getMessageAttachments';
import ThinkBlock from './ThinkBlock.vue';
import MessageInteractions from './MessageInteractions.vue';
import MessageModelSelector from './MessageModelSelector.vue';
import MessageEditor from '../MessageEditor.vue';

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

    messagesStore.editMessage(props.message.id, newText);
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
    <div class="group/message m-2 flex flex-col">
        <div class="box-border p-4 flex flex-col" :class="{
            'ml-auto rounded-2xl bg-background-light max-w-[70%] shadow-md shadow-background-dark/50': isUserMessage && !editing,
            'w-full max-w-[calc(100dvw-1rem)] box-border !p-2 !m-0': isModelMessage || editing
        }">
            <div v-if="message.type === 'model'" class="group/msg-header flex flex-row items-center gap-2 mb-2">
                <ModelIcon :name="message.model" :ignore-styling="true"
                    class="size-10 p-2 bg-border-muted rounded-full ring-1 ring-border" />

                <MessageModelSelector
                    :modelMessageDone
                    :message />

                <div class="grow"></div>

                <span class="flex flex-row gap-1 items-center opacity-0 group-hover/msg-header:opacity-100 transition-opacity duration-dynamic">
                    <BiTimeFive />
                    {{message.created.toLocaleString() }}
                </span>
            </div>
            <img v-for="image of images" :key="image.id" :src="image.blobSrc"
                class="rounded-xl max-w-64 max-h-full cursor-pointer mb-2"
                @click="emitter.emit('openLightbox', { image: image.file })" alt="Message attached media" />

            <MessageEditor v-if="editing" ref="messageEditorRef" :messageText="message.content"
                @onCancelEdit="cancelEditing" @onFinishEditing="finishEdit" />

            <div class="relative" v-else>
                <div v-if="isUserMessage" class="max-w-none prose prose-app! dark:prose-invert">
                    {{ message.content }}
                </div>
                <span v-else-if="isModelMessage" class="flex flex-col">
                    <ThinkBlock :message="(message as ModelChatMessage)" />
                    <span class="max-w-none prose prose-app! dark:prose-invert inline-block" v-html="renderText(message.content)">
                    </span>
                    <div v-if="message.type === 'model'" class="animate-breathe rounded-full bg-text inline-block"
                        :class="{
                            'size-6': message.status === 'waiting',
                            'size-4': message.status === 'generating',
                        }"></div>
                </span>
            </div>
        </div>
        <MessageInteractions v-if="!editing" :message="message" :done="modelMessageDone" @editMessage="editMessage" />
    </div>
</template>