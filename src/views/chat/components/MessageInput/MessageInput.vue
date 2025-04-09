<script setup lang="ts">
import { computed, ref } from 'vue';
import ModelSelect from '@/components/ModelSelect/ModelSelect.vue';
import ActionButton from './ActionButton.vue';
import ScrollToBottomButton from './ScrollToBottomButton.vue';
import PersonaSelect from '@/components/PersonaSelect/PersonaSelect.vue';
import { AiFillCloseCircle, AiOutlineUpload } from 'vue-icons-plus/ai';
import { emitter } from '@/mitt';
import useMessagesStore from '@/stores/messagesStore';
import logger from '@/utils/logger';

const messagesStore = useMessagesStore();

const messageInput = ref<HTMLTextAreaElement | null>(null);
const messageInputValue = ref('');

const canGenerate = computed<boolean>(() => {
    return messageInputValue.value.trim() !== '';
});

function inputKeyUp(e: KeyboardEvent) {
    updateTextAreaHeight();

    if (!canGenerate) {
        return;
    }

    if (e.key !== 'Enter') {
        return;
    }

    if (e.shiftKey) {
        return;
    }

    startGeneration();
}

async function startGeneration() {
    const message = messageInputValue.value.trim();

    messagesStore.sendMessage(message, filesToUpload.value);
    messageInputValue.value = "";
    filesToUpload.value = [];
    updateTextAreaHeight();
}

function updateTextAreaHeight() {
    messageInput.value!.style.height = "auto";
    messageInput.value!.style.height = (1 + messageInput.value!.scrollHeight) + "px";
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

</script>

<template>
    <div class="w-full flex flex-row justify-center">
        <div class="w-full sm:w-full lg:w-3xl mx-1 mb-1 sm:mx-1 sm:mb-1 md:mx-4 md:mb-2 p-2 
                box-border flex flex-col items-center max-h-[48rem] relative bg-primary-400 rounded-xl">
            <ScrollToBottomButton />
            <textarea ref="messageInput" v-model="messageInputValue" @keyup="inputKeyUp"
                placeholder="Enter a message..."
                class="w-full box-border text-base p-2 border-none outline-none resize-none overflow-y-auto break-words"></textarea>

            <!-- List of uploaded files -->
            <div class="w-full max-h-16">
                <div v-for="file in filesToUpload" :key="file.name" class="inline-block h-full p-2 pb-3 relative">
                    <img :src="createObjectUrl(file)"
                        class="ring-1 ring-txt-2 rounded-lg h-full cursor-pointer hover:brightness-115 transition-color duration-150"
                        @click="openInLightbox(file)" />
                    <AiFillCloseCircle
                        class="absolute top-0 right-0 drop-shadow-[0_0_2px_black] hover:text-red-300 cursor-pointer transition-colors duration-150"
                        @click="removeFileFromUploadList(file)" />
                </div>
            </div>
            <div class="relative flex flex-row justify-between w-full">
                <div class="flex flex-row gap-2">
                    <div class="aspect-square box-border bg-primary-400 hover:bg-primary-500 cursor-pointer rounded-lg text-txt-2 hover:text-txt-1 transition-colors duration-150 select-none ring-[1px] ring-txt-2/25"
                        title="Upload file(s)">
                        <label for="file-upload" class="cursor-pointer size-full flex items-center justify-center">
                            <AiOutlineUpload />
                        </label>
                        <input type="file" id="file-upload" class="hidden" accept="image/*" multiple
                            @change="uploadFile" />
                    </div>
                    <ModelSelect direction="up" />
                    <PersonaSelect direction="up" />
                </div>
                <ActionButton :canGenerate="canGenerate" @startGeneration="startGeneration" />
            </div>
        </div>
    </div>
</template>