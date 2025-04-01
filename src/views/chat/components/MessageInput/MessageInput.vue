<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAllChatsStore } from '@/stores/allChats';
import { useRoute } from 'vue-router';
import ModelSelect from '@/components/ModelSelect/ModelSelect.vue';
import { useConfigStore } from '@/stores/config';
import ActionButton from './ActionButton.vue';
import ScrollToBottomButton from './ScrollToBottomButton.vue';
import PersonaSelect from '@/components/PersonaSelect/PersonaSelect.vue';
import { AiFillCloseCircle, AiOutlineUpload } from 'vue-icons-plus/ai';
import { emitter } from '@/mitt';

const route = useRoute();
const allChats = useAllChatsStore();
const config = useConfigStore();

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
    const images = await filesAsBase64(filesToUpload.value);

    messageInputValue.value = "";
    filesToUpload.value = [];
    updateTextAreaHeight();

    const selectedModel = localStorage.getItem('selectedModel');

    if (!selectedModel) {
        throw new Error('No selected model found in localStorage.')
    }

    allChats.sendMessage(message, {
        chatId: route.params.id as string,
        requestUrl: config.apiUrl('/api/chat'),
        selectedModel: selectedModel,
        images: images,
    });
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
        }
    }
}

function filesAsBase64(files: File[]): Promise<string[]> {
    return Promise.all([...files].map(file => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString().split(',')[1] as string);
            reader.onerror = (error) => reject(error);
        });
    }));
}

async function openInLightbox(file: File) {
    const fileBase64 = (await filesAsBase64([file]))[0];

    emitter.emit('openLightbox', {
        imageB64: fileBase64,
        imageMime: file.type,
    });
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