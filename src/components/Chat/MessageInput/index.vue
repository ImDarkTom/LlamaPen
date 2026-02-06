<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { emitter } from '@/lib/mitt';
import useMessagesStore from '@/stores/messagesStore';
import logger from '@/lib/logger';
import { promptChatDeletion } from '@/utils/core/promptDeleteChat';
import useChatsStore from '@/stores/chatsStore';
import router from '@/lib/router';
import { useConfigStore } from '@/stores/config';
import { BiSolidXCircle } from 'vue-icons-plus/bi';
import isOnMobile from '@/utils/core/isOnMobile';
import { useProviderManager } from '@/composables/useProviderManager';

const messagesStore = useMessagesStore();
const chatsStore = useChatsStore();
const config = useConfigStore();
const { isConnected } = useProviderManager();

const messageInputRef = ref<HTMLTextAreaElement | null>(null);
const messageInputValue = ref('');

const canGenerate = computed<boolean>(() => {
    return messageInputValue.value.trim() !== '' && isConnected.value;
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
        if (isOnMobile()) {
            // On mobile, let the user add new lines with Enter
            return;
        }

        e.preventDefault();
        startGeneration();
    }
}

async function startGeneration() {
    if (!canGenerate.value) return;

    const message = messageInputValue.value.trim();
    messagesStore.sendMessage(message, filesToUpload.value);
    
    messageInputValue.value = "";
    filesToUpload.value = [];

    if (messageInputRef.value) {
        messageInputRef.value.innerText = "";
    }
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
            class="w-[calc(100%-1rem)] lg:w-3xl mx-4 mb-2 p-2
                box-border flex flex-col items-center max-h-192 relative bg-background-light rounded-xl
                transition-all duration-dynamic
                shadow-elevation-1
                hover:shadow-elevation-2
                focus-within:shadow-elevation-3
                hover:focus-within:shadow-elevation-3">
            <ChatMessageInputScrollToBottomButton />
            <div
                ref="messageInputRef"
                class="text-text w-full box-border p-2 pb-8 text-base border-none outline-none resize-none max-h-48 overflow-y-auto wrap-break-word empty:before:content-[attr(data-placeholder)] empty:before:text-text-muted/60"
                contenteditable="true"
                :data-placeholder="messagesStore.openedChatId === null ? 'Enter a message...' : 'Reply...'"
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
                <div class="flex flex-row gap-2 overflow-x-auto p-px">
                    <ChatMessageInputButtonFileUpload :onChange="uploadFile" />
                    <ChatModelSelect />
                    <ChatMessageInputButtonToggleThinking v-model="config.chat.thinking.enabled" />
                    <ChatMessageInputButtonTools />
                    <ChatMessageInputGenerationOptionsButton />
                    <!-- we could revisit the persona selector later -->
                </div>
                <ChatMessageInputActionButton :canGenerate @startGeneration="startGeneration" />
            </div>
        </div>
    </div>
</template>