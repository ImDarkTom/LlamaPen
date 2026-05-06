<script setup lang="ts">
import { ref } from 'vue';
import { BiCloudDownload, BiDownload, BiListPlus, BiPlus, BiPurchaseTagAlt, BiStopCircle } from 'vue-icons-plus/bi';
import useDownloadsStore from '@/stores/useDownloadsStore';
import { storeToRefs } from 'pinia';
import type { ProgressResponse } from 'ollama';
import useOllamaModelLibraryStore from '@/stores/useOllamaModelLibrary';

const downloadsStore = useDownloadsStore();
const { progressChunks } = storeToRefs(downloadsStore)

const emit = defineEmits<{
    refreshModelList: [];
}>();

const modelInputValue = ref<string>('');

async function downloadModel() {
    const modelName = modelInputValue.value;
    if (!modelName.trim()) {
        return;
    }

    const { success, reason } = await downloadsStore.downloadModel(modelName);
    if (success) {
        emit('refreshModelList');
    } else {
        alert(reason);
    }
}

const getStatusText = (status: ProgressResponse) => 
    status.completed 
        ? `${(status.completed / 1024 / 1024).toFixed(2)}MB / ${((status.total ?? 0) / 1024 / 1024).toFixed(2)}MB` 
        : 'Waiting...';

const ollamaModelLibrary = useOllamaModelLibraryStore();
ollamaModelLibrary.fetchOnce();

const modelNames = computed(() => {
    if (ollamaModelLibrary.status !== 'done') return [];

    return ollamaModelLibrary.ollamaModels.flatMap(model => {
        const sizes = model.sizes.map(size => `${model.model}:${size}`);
        const cloud = model.hasCloud ? [`${model.model}:cloud`] : [];

        return [...sizes, ...cloud];
    })
});

const modelInput = ref<HTMLInputElement | null>(null);

function selectModel(modelVariant: string) {
    modelInputValue.value = modelVariant;
    modelInput.value?.focus();
}
</script>

<template>
    <UIViewerContainer class="flex flex-col gap-2">
        <form 
            class="flex flex-row gap-2 w-full"
            @submit.prevent="downloadModel">
            <input 
                type="text" 
                placeholder="Model tag (e.g. gemma4:e2b)"
                class="w-full bg-base-800 px-6 py-4 rounded-md outline-none ring-1 ring-inset ring-base-600 focus:ring-base-300"
                v-model="modelInputValue"
                ref="modelInput"
                required
                aria-label="Model ID input"
                list="model-suggestions" />
            <datalist id="model-suggestions">
                <option
                    v-for="model in modelNames"
                    :key="model"
                    :value="model"></option>
            </datalist>

            <button
                type="submit"
                class="bg-base-700 hover:bg-base-600 transition-all duration-dynamic hover:duration-0 px-4 rounded-md text-lg w-fit cursor-pointer" >
                <span class="whitespace-normal md:whitespace-nowrap">
                    <BiCloudDownload class="inline mr-2 align-middle" /> 
                    <span class="align-middle">Download</span>
                </span>
            </button>
        </form>

        <div class="flex flex-col gap-2">
            <div class="bg-base-800 p-2 rounded-lg">
                <div
                    v-if="Object.keys(progressChunks).length !== 0"
                    class="flex flex-col gap-2">
                    <div 
                        v-for="(status, modelName) in progressChunks"
                        :key="modelName"
                        class="p-4 rounded-md flex flex-col gap-4 bg-base-700" >
                        <div class="flex flex-row gap-4">
                            <IconModel :name="modelName" class="size-12" />

                            <div class="flex flex-col gap-2 w-full">
                                <div class="text-base-100 font-medium text-lg">
                                    {{ modelName }}
                                </div>
                                <div class="text-sm flex flex-col gap-1">
                                    <span>
                                        {{ status.status }}
                                    </span>
                                    <span class="flex flex-row gap-1 justify-between font-medium">
                                        <span>
                                            {{ getStatusText(status) }}
                                        </span>
                                        <span class="text-base-100">
                                            {{ Math.round((status.completed ? status.completed / (status.total ?? 0) : 0) * 100) }}%
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-row gap-2">
                            <progress
                                class="bg-base-800 w-full h-10 rounded-md"
                                :max="status.total" 
                                :value="status.completed"></progress>
                            <ButtonPrimary
                                text="Cancel" 
                                class="p-2!"
                                :icon="BiStopCircle" 
                                @click="downloadsStore.cancelDownload(modelName)" />
                        </div>
                    </div>
                </div>
                <div 
                    v-else
                    class="text-center text-sm font-medium">
                    No models currently downloading
                </div>
            </div>

            <UITextDivider text="Ollama Library" />
            <div class="bg-base-800 p-2 rounded-lg">
                <span 
                    v-if="ollamaModelLibrary.status === 'loading' || ollamaModelLibrary.status === 'idle'">
                    Loading...
                </span>
                <span 
                    v-if="ollamaModelLibrary.status === 'error'">
                    Error: ${{ ollamaModelLibrary.error }}
                </span>
                <ul 
                    v-else
                    class="flex flex-col gap-2">
                    <li
                        v-for="model in ollamaModelLibrary.ollamaModels"
                        class="bg-base-700 p-2 rounded-md flex flex-row gap-2"
                        :key="model.model">
                        <div class="flex flex-col">
                            <IconModel 
                                :name="model.model"
                                class="size-8" />
                        </div>
                        <div class="grow w-full min-w-0">
                            <span class="font-semibold">
                                {{ model.model }}
                            </span>
                            <p class="text-sm">
                                {{ model.description ? model.description : '(No description)' }}
                            </p>
                            <div class="flex flex-row gap-2 mt-2">
                                <span class="text-xs font-medium flex flex-row items-center gap-1 bg-base-600 p-0.5 px-2 rounded-full">
                                    <BiDownload class="size-4" />
                                    {{ model.pullCount }}
                                </span>
                                <span class="text-xs font-medium flex flex-row items-center gap-1 bg-base-600 p-0.5 px-2 rounded-full">
                                    <BiListPlus class="size-4" />
                                    {{ new Date(model.lastUpdated).toLocaleDateString() }}
                                </span>
                                <span class="text-xs font-medium flex flex-row items-center gap-1 bg-base-600 p-0.5 px-2 rounded-full">
                                    <BiPurchaseTagAlt class="size-4" />
                                    {{ model.tagCount }}
                                </span>
                            </div>
                            <div class="flex flex-row gap-2 mt-2 overflow-auto max-w-full">
                                <button
                                    v-if="model.hasCloud"
                                    class="bg-base-600 hover:bg-base-500 rounded-full p-1 px-3 flex items-center flex-row gap-1 cursor-pointer select-none"
                                    @click="selectModel(`${model.model}:cloud`)">
                                    <BiPlus />
                                    Cloud
                                </button>
                                <button
                                    v-for="size in model.sizes"
                                    class="bg-base-600 hover:bg-base-500 rounded-full p-1 px-3 flex items-center flex-row gap-1 cursor-pointer select-none"
                                    :key="size"
                                    @click="selectModel(`${model.model}:${size}`)">
                                    <BiCloudDownload />
                                    {{ size }}
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </UIViewerContainer>
</template>