<script setup lang="ts">
import MessageOptions from './MessageOptions.vue';
import { computed, nextTick, ref } from 'vue';

import MessageEditor from './MessageEditor.vue';
import { emitter } from '@/mitt';
import useMessagesStore from '@/stores/messagesStore';

import { nanoid } from 'nanoid';
import ThinkBlock from './ChatMessage/ThinkBlock.vue';
import messageMarked from '@/utils/chatMarked';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import { AiOutlineSwap } from 'vue-icons-plus/ai';
import Tooltip from '@/components/Tooltip/Tooltip.vue';

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

function renderText(text: string) {
    if (!text.startsWith('<think>')) {
        return messageMarked.parse(text);
    }

    const afterThinkRegex = /(?<=<\/think>)([\s\S]*)/i;;
    const allAfterThinkBlock = afterThinkRegex.exec(text)?.[1] || '';

    return messageMarked.parse(allAfterThinkBlock);
}
</script>

<template>
    <div class="group/message m-2 flex flex-col">
        <div class="text-txt-1 box-border p-4 flex flex-col" :class="{
            'ml-auto rounded-2xl bg-primary-300 max-w-[70%] shadow-sm shadow-black/50': isUserMessage && !editing,
            'w-full box-border !p-2 !m-0': isModelMessage || editing
        }">
            <div v-if="message.type === 'model'" class="group/msg-header flex flex-row items-center gap-2 mb-2">
                <ModelIcon 
                    :name="message.model" 
                    :ignore-styling="true" 
                    class="size-10 p-2 bg-primary-700 rounded-full ring-1 ring-txt-1" />

                <Tooltip text="Change Model">
                    <div class="flex flex-row p-1 gap-1 group/msg-model bg-transparent hover:bg-primary-300 cursor-pointer rounded-xl items-center
                        transition-colors duration-100">
                        <span class="font-semibold pl-1">{{ message.model }}</span>
                        <AiOutlineSwap class="p-1 size-8 opacity-35 group-hover/msg-model:opacity-100 transition-opacity duration-100" />
                    </div>
                </Tooltip>

                <div class="grow"></div>

                <span class="text-txt-2 opacity-0 group-hover/msg-header:opacity-100 transition-opacity duration-100">{{ message.created.toLocaleString() }}</span>
            </div>
            <img v-for="image of images" :key="image.id" :src="image.blobSrc"
                class="rounded-xl max-w-full max-h-full cursor-pointer mb-2"
                @click="emitter.emit('openLightbox', { image: image.file })" />

            <MessageEditor v-if="editing" ref="messageEditorRef" :messageText="message.content"
                @onCancelEdit="cancelEditing" @onFinishEditing="finishEdit" />

            <div class="relative" v-else>
                <div 
                    v-if="isUserMessage" 
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
                    <div v-if="message.type === 'model'"
                        class="animate-breathe rounded-full bg-txt-1 inline-block"
                        :class="{ 
                            'size-6': message.status === 'waiting',
                            'size-4': message.status === 'generating',
                        }"></div>
                </span>
            </div>
        </div>
        <MessageOptions v-if="!editing" class="opacity-100 group-hover/message:opacity-100" :message="message"
            @editMessage="editMessage" />
    </div>
</template>