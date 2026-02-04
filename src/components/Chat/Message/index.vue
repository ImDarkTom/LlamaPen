<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { emitter } from '@/lib/mitt';
import { nanoid } from 'nanoid';
import { renderMarkdown } from '@/lib/marked';
import { getMessageAttachments } from '@/utils/core/getMessageAttachments';
import useMessagesStore from '@/stores/messagesStore';
import { BiError, BiRefresh } from 'vue-icons-plus/bi';
import type Editor from './Editor.vue';

const { editMessage, isMessageGenerating } = useMessagesStore();

const props = defineProps<{
    message: ChatMessage;
}>();

const messageTextContainer = ref<HTMLDivElement | null>(null);

// === State ===
const editing = ref<boolean>(false);
const messageEditorRef = ref<InstanceType<typeof Editor> | null>(null);
const images = ref<{ id: string; blobSrc: string; file: Blob }[]>([]);

onMounted(async () => {
    const messageAttachments = (await getMessageAttachments(props.message.id)).map(item => item.content);
    images.value = messageAttachments.map((attachment) => {
        return {
            id: nanoid(),
            blobSrc: URL.createObjectURL(attachment),
            file: attachment,
        }
    });

    messageTextContainer.value?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('copy-code-button')) {
            const code = decodeURIComponent(target.dataset.code || "");
            navigator.clipboard.writeText(code);

            target.textContent = 'Copied!'
            setTimeout(() => {
                target.textContent = 'Copy';
            }, 1000);
        }
    })
})

// === Computed ===
const isUserMessage = computed(() => props.message.type === 'user');
const isModelMessage = computed(() => props.message.type === 'model');
const messageState = computed(() => isMessageGenerating(props.message));
const modelMessageNotGenerating = computed(() => 
    props.message.type === 'model' 
    && (
        props.message.status === 'finished'
        || props.message.status === 'cancelled'
        || (props.message.status === 'inProgress' && !messageState.value.generating)
    )
);

// === Functions ===

// Editing
function handleEditBtnClick() {
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

    editMessage(props.message.id, newText, props.message.type, false);
}

function finishAndContinue(newText: string) {
    editing.value = false;

    editMessage(props.message.id, newText, props.message.type, true);
}

// Rendering
function renderText(text: string) {
    if (!text.startsWith('<think>')) {
        return renderMarkdown(text);
    }

    const afterThinkRegex = /(?<=<\/think>)([\s\S]*)/i;
    const allAfterThinkBlock = afterThinkRegex.exec(text)?.[1] || '';

    return renderMarkdown(allAfterThinkBlock);
}

</script>

<template>
    <div class="group/message m-2 mb-0 flex flex-col" ref="messageTextContainer">
        <div class="box-border p-4 flex flex-col" :class="{
            'ml-auto rounded-2xl bg-background-light max-w-[70%] shadow-md shadow-background-dark/50': isUserMessage && !editing,
            'w-full max-w-[calc(100dvw-1rem)] box-border p-2! pb-1! m-0!': isModelMessage || editing,
            'bg-surface m-0! rounded-xl': props.message.type === 'tool'
        }">
            <ChatMessageModelMessageHeader v-if="message.type === 'model'" :message :modelMessageDone="modelMessageNotGenerating" />
            <img 
                v-for="image of images" 
                :key="image.id" 
                :src="image.blobSrc"
                class="rounded-xl max-w-64 max-h-full cursor-pointer mb-2"
                @click="emitter.emit('openLightbox', { image: image.file })" alt="Message attached media" />

            <ChatMessageEditor
                v-if="editing" 
                ref="messageEditorRef" 
                :message
                @onCancelEdit="cancelEditing" 
                @onFinishEditing="finishEdit"
                @onFinishAndContinue="finishAndContinue" />

            <div class="relative" v-else>
                <div v-if="message.errorText" class="italic bg-danger/25 p-2 rounded-lg ring-1 ring-danger/50 text-danger">
                    <BiError class="inline mr-1 pb-0.5" />
                    <span class="text-center">{{ message.errorText }}</span>
                </div>
                <article 
                    v-if="message.type === 'user'" 
                    class="max-w-none prose prose-app! dark:prose-invert" >
                    {{ message.content }}
                </article>
                <div 
                    v-else-if="message.type === 'model'" >
                    <ChatMessageThinkBlock :message="(message as ModelChatMessage)" :messageState />
                    <ChatMessageModelToolCalls :message="(message as ModelChatMessage)" />
                    <article class="max-w-none prose prose-app! dark:prose-invert" v-html="renderText(message.content)"></article>
                    <div
                        v-if="messageState.generating"
                        class="animate-breathe rounded-full bg-text inline-block"
                        :class="{
                            'size-6': messageState.status === 'waiting',
                            'size-4': messageState.status === 'generating',
                        }"></div>
                    <div v-else-if="message.status === 'inProgress'">
                        <!-- if state is marked as 'inProgress', but we don't have an associated messageState, generation got interrupted -->
                        <div>
                            <div class="w-full h-px bg-text-muted/50 my-2"></div>
                            <span class="text-text-muted/75 italic mr-2">Generation interrupted.</span>
                            <button 
                                class="bg-background-light p-2 ring-1 ring-border rounded-md cursor-pointer outline-0 hover:outline-2 outline-highlight transition-all duration-dynamic"
                                @click="editMessage(message.id, message.content, message.type, true);">
                                <BiRefresh class="inline mr-1" />
                                <span>Continue</span>
                            </button>
                        </div>
                    </div>
                </div>
                <ChatMessageToolCallsMessage :message v-else-if="message.type === 'tool'" />
            </div>
        </div>
        <ChatMessageInteractions
            class="transition-opacity duration-dynamic hover:duration-0"
            :class="{
                'group-hover/message:opacity-100 md:opacity-0': message.type === 'user'
            }"
            v-if="!editing" 
            :message 
            :done="modelMessageNotGenerating" 
            @editMessage="handleEditBtnClick" />
    </div>
</template>