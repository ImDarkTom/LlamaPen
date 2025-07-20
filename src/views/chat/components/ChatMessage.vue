<script setup lang="ts">
import MessageInteractions from './ChatMessage/MessageInteractions.vue';
import { computed, nextTick, onMounted, ref } from 'vue';

import MessageEditor from './MessageEditor.vue';
import { emitter } from '@/lib/mitt';
import useMessagesStore from '@/stores/messagesStore';

import { nanoid } from 'nanoid';
import ThinkBlock from './ChatMessage/ThinkBlock.vue';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import { AiOutlineSwap } from 'vue-icons-plus/ai';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import ollamaApi from '@/utils/ollama';
import { VscDebugRestart } from 'vue-icons-plus/vsc';
import logger from '@/lib/logger';
import { BiTimeFive } from 'vue-icons-plus/bi';
import { renderMarkdown } from '@/lib/marked';

const messagesStore = useMessagesStore();

const props = defineProps<{
    message: ChatMessage;
}>();

// === State ===
const editing = ref<boolean>(false);
const messageEditorRef = ref<InstanceType<typeof MessageEditor> | null>(null);

// === Computed ===
const images = (props.message.attachments || []).map((file) => {
    return {
        id: nanoid(),
        blobSrc: URL.createObjectURL(file),
        file,
    }
});

const isUserMessage = computed(() => props.message.type === 'user');
const isModelMessage = computed(() => props.message.type === 'model');
const modelMessageDone = computed(() => props.message.type === 'model' &&
    (props.message.status === 'finished' || props.message.status === 'cancelled')
);

// === Hooks ===
const allModels = ref<ModelList>([]);

onMounted(async () => {
    allModels.value = (await ollamaApi.getModels()).filter(model => props.message.type === 'model' && props.message.model !== model.name)
});


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

// Regeneration
const modelSelectionOpened = ref<boolean>(false);

function changeModel(e: MouseEvent) {
    if (!modelMessageDone.value) return;
    e.preventDefault();

    modelSelectionOpened.value = !modelSelectionOpened.value;
}

function closeModelSelection() {
    if (!modelSelectionOpened.value) return;

    modelSelectionOpened.value = false;
}

function regenerateMessage(model: string) {
    modelSelectionOpened.value = false;
    logger.info('Message Options Component', `Regenerating message id ${props.message.id} with different model ${model}.`);
    messagesStore.regenerateMessage(props.message.id, model);
}
</script>

<template>
    <div class="group/message m-2 flex flex-col">
        <div class="box-border p-4 flex flex-col" :class="{
            'ml-auto rounded-2xl bg-background-light max-w-[70%] shadow-md shadow-background-dark/50': isUserMessage && !editing,
            'w-full box-border !p-2 !m-0': isModelMessage || editing
        }">
            <div v-if="message.type === 'model'" class="group/msg-header flex flex-row items-center gap-2 mb-2">
                <ModelIcon :name="message.model" :ignore-styling="true"
                    class="size-10 p-2 bg-border-muted rounded-full ring-1 ring-border" />

                <div class="relative" v-mousedown-outside="closeModelSelection">
                    <Tooltip text="Regenerate" :disabled="!modelMessageDone">
                        <div class="flex flex-row p-1 gap-1 group/msg-model bg-transparent rounded-xl items-center transition-colors duration-dynamic"
                            :class="{ 'hover:bg-background-light cursor-pointer': modelMessageDone }"
                            @mousedown="changeModel">
                            <span class="font-semibold pl-1 select-none">{{ message.model }}</span>
                            <AiOutlineSwap v-if="modelMessageDone"
                                class="p-1 size-8 opacity-35 group-hover/msg-model:opacity-100 transition-opacity duration-dynamic" />
                        </div>
                    </Tooltip>
                    <div v-if="modelSelectionOpened"
                        class="max-h-[50vh] overflow-y-auto absolute top-0 left-[50%] -translate-x-[50%] translate-y-12 flex flex-col bg-surface z-20 p-2 rounded-xl gap-2">
                        <button
                            class="p-2 hover:scale-[98%] hover:bg-surface-light hover:text-text rounded-lg w-full min-w-48 cursor-pointer transition-all duration-dynamic flex flex-row items-center justify-start"
                            @mouseup="regenerateMessage(message.model)">
                            <VscDebugRestart class="size-6 mr-2 p-0.5" />
                            {{ message.model }}
                        </button>

                        <button v-for="model in allModels" :key="model.digest"
                            class="p-2 hover:scale-[98%] hover:bg-surface-light hover:text-text rounded-lg w-full min-w-48 cursor-pointer transition-all duration-dynamic flex flex-row items-center justify-start"
                            @mouseup="regenerateMessage(model.model)">
                            <ModelIcon :name="model.model" class="size-6 mr-2" />
                            {{ model.name }}
                        </button>
                    </div>
                </div>

                <div class="grow"></div>

                <span class="flex flex-row gap-1 items-center opacity-0 group-hover/msg-header:opacity-100 transition-opacity duration-dynamic">
                    <BiTimeFive />
                    {{message.created.toLocaleString() }}
                </span>
            </div>
            <img v-for="image of images" :key="image.id" :src="image.blobSrc"
                class="rounded-xl max-w-full max-h-full cursor-pointer mb-2"
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