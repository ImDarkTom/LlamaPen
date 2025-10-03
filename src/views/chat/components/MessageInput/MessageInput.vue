<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import ModelSelect from '@/components/ModelSelect/ModelSelect.vue';
import ActionButton from './ActionButton.vue';
import ScrollToBottomButton from './ScrollToBottomButton.vue';
import { emitter } from '@/lib/mitt';
import useMessagesStore from '@/stores/messagesStore';
import logger from '@/lib/logger';
import { promptChatDeletion } from '@/utils/core/promptDeleteChat';
import useChatsStore from '@/stores/chatsStore';
import router from '@/lib/router';
import FileUpload from './buttons/FileUpload.vue';
import ThinkingButton from './buttons/ThinkingButton.vue';
import { useConfigStore } from '@/stores/config';
import MessageOptions from './buttons/MessageOptions.vue';
import { BiSolidXCircle } from 'vue-icons-plus/bi';
import MessageTools from './buttons/MessageTools.vue';
import { useModelList } from '@/composables/useModelList';

const messagesStore = useMessagesStore();
const chatsStore = useChatsStore();
const config = useConfigStore();
const { connectedToOllama } = useModelList();

const messageInputRef = ref<HTMLTextAreaElement | null>(null);
const messageInputValue = ref('');

const canGenerate = computed<boolean>(() => {
    return messageInputValue.value.trim() !== '' && connectedToOllama.value;
});

const focusInput = () => {
    if (!messageInputRef.value) {
        return;
    }

    messageInputRef.value.focus();
};

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);

    emitter.on('focusInputBar', focusInput);

    if (!messageInputRef.value) return;
    messageInputRef.value.addEventListener('paste', handleClipboardEvent);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown);

    emitter.off('focusInputBar', focusInput);

    if (!messageInputRef.value) return;
    messageInputRef.value.addEventListener('paste', handleClipboardEvent);
});

async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && e.shiftKey) {
        e.preventDefault();
        focusInput();
    }

    if (e.ctrlKey && e.shiftKey && e.key === 'Backspace') {
        e.preventDefault();

        if (!messagesStore.openedChatId) {
            logger.info('Message Input Component', 'No opnened chat id, unable to delete.');
            return;
        }

        const openedChat = await chatsStore.getChat(messagesStore.openedChatId);
        if (!openedChat) {
            logger.info('Message Input Component', 'Opened chat not found, unable to delete.');
            return;
        }

        promptChatDeletion(openedChat);
    }

    if (e.key === 'O' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        router.push('/chat');
    }
}

function inputKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { 
        e.preventDefault();

        if (!canGenerate.value) {
            return;
        }
        
        startGeneration();
        messageInputValue.value = "";
        if (messageInputRef.value) {
            messageInputRef.value.innerText = "";
        }
    }
}

async function startGeneration() {
    const message = messageInputValue.value.trim();

    messagesStore.sendMessage(message, filesToUpload.value);
    messageInputValue.value = "";
    filesToUpload.value = [];
}

function uploadFile(e: Event) {
    const input = e.target as HTMLInputElement;

    if (input.files) {
        for (const file of input.files) {
            filesToUpload.value.unshift(file);
            logger.info('Message Input Component', 'Added file for upload', file, 'files to upload list now', filesToUpload.value);
        }
    }

}

async function openInLightbox(file: File) {
    emitter.emit('openLightbox', { image: file });
}

function removeFileFromUploadList(file: File) {
    filesToUpload.value = filesToUpload.value.filter(f => f !== file);
}

const filesToUpload = ref<File[]>([]);

const createObjectUrl = (file: File) => URL.createObjectURL(file);

function handleClipboardEvent(event: ClipboardEvent) {
    if (!event.clipboardData) return;

    for (const item of event.clipboardData.items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (!file) continue;

            handlePastedImage(file);
            event.preventDefault();
        } else if (!item.type.startsWith('text/')) {
            alert(`Unsupported attachment type ${item.type}. Please only upload images.`)
        }
    }
}

function handlePastedImage(file: File) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const fakeInput = document.createElement('input');
    fakeInput.type = 'file';
    fakeInput.files = dataTransfer.files;

    const event = new Event('change', { bubbles: true });
    fakeInput.dispatchEvent(event);

    uploadFile({ target: fakeInput } as unknown as Event);
}

function onInput(e: Event) {
    const target = (e.target as HTMLDivElement);
    messageInputValue.value = target.innerText;

    if (messageInputValue.value === "\n" || messageInputValue.value === "\r\n") {
        target.innerHTML = "";
    }
}

</script>

<template>
    <div class="w-full flex justify-center">
        <div
            class="w-[calc(100%-1rem)] lg:w-3xl mx-4 mb-2 p-2 shadow-sm
                box-border flex flex-col items-center max-h-[48rem] relative bg-background-light rounded-xl">
            <ScrollToBottomButton />
            <div
                ref="messageInputRef"
                class="text-text    w-full box-border p-2 pb-8 text-base border-none outline-none resize-none max-h-48 overflow-y-auto break-words empty:before:content-[attr(data-placeholder)] empty:before:text-text-muted/60"
                contenteditable="true"
                :data-placeholder="'Enter a message...'"
                @input="onInput"
                @keydown="inputKeyDown" />

            <!-- List of uploaded files -->
            <div class="w-full max-h-16">
                <div v-for="file in filesToUpload" :key="file.name" class="inline-block h-full p-2 pb-3 relative">
                    <img :src="createObjectUrl(file)"
                        class="ring-1 ring-primary rounded-lg h-full cursor-pointer hover:brightness-115 transition-color duration-dynamic"
                        @click="openInLightbox(file)" alt="User attached image" />
                    <BiSolidXCircle
                        class="absolute top-0 right-0 drop-shadow-sm drop-shadow-background hover:text-red-300 cursor-pointer transition-colors duration-dynamic"
                        @click="removeFileFromUploadList(file)" />
                </div>
            </div>
            <div class="relative flex flex-row gap-2 justify-between w-full">
                <div class="flex flex-row gap-2 overflow-x-auto p-[1px]">
                    <FileUpload :onChange="uploadFile" />
                    <ModelSelect direction="up" />
                    <ThinkingButton v-model="config.chat.thinking.enabled" />
                    <MessageTools />
                    <MessageOptions />
                    <!-- we could revisit the persona selector later -->
                </div>
                <ActionButton :canGenerate @startGeneration="startGeneration" />
            </div>
        </div>
    </div>
</template>