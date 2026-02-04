<script setup lang="ts">
import { ref } from 'vue';
import ViewerContainer from './ViewerContainer.vue';
import { BiCloudDownload, BiStopCircle } from 'vue-icons-plus/bi';
import useDownloadsStore from '@/stores/useDownloadsStore';
import { storeToRefs } from 'pinia';

const downloadsStore = useDownloadsStore();
const { progressChunks } = storeToRefs(downloadsStore)

const emit = defineEmits<{
    refreshModelList: [];
}>();

const modelInputValue = ref<string>('');

async function downloadModel() {
    if (!modelInputValue.value) return;

    const modelName = modelInputValue.value;
    if (!modelName) {
        return;
    }

    const { success, reason } = await downloadsStore.downloadModel(modelName);
    if (success) {
        emit('refreshModelList');
    } else {
        alert(reason);
    }
}
</script>

<template>
    <ViewerContainer class="flex flex-col gap-2">
        <form 
            class="flex flex-row gap-2 w-full"
            @submit.prevent="downloadModel">
            <input 
                type="text" 
                placeholder="Model tag (e.g. gemma3:latest)"
                class="w-full bg-surface px-4 py-6 rounded-md text-lg"
                v-model="modelInputValue"
                required
                aria-label="Model ID input">
            <button
                type="submit"
                class="bg-primary hover:bg-secondary transition-all duration-dynamic hover:duration-0 text-background p-4 rounded-md text-lg w-fit cursor-pointer" >
                <span class="whitespace-normal md:whitespace-nowrap">
                    <BiCloudDownload class="inline mr-2 align-middle" /> 
                    <span class="align-middle">Start Download</span>
                </span>
            </button>
        </form>

        <div
            v-if="Object.keys(progressChunks).length !== 0"
            class="flex flex-col gap-2">
            <div 
                v-for="(status, modelName) in progressChunks"
                :key="modelName"
                class="p-4 rounded-md flex flex-col gap-4 bg-surface" >
                <div class="flex flex-row gap-4">
                    <IconModel :name="modelName" class="size-12" />

                    <div class="flex flex-col gap-2 w-full">
                        <div class="text-text text-xl">
                            {{ modelName }}
                        </div>
                        <div class="text-sm flex flex-col gap-1">
                            <span>
                                {{ status.status }}
                            </span>
                            <span class="flex flex-row gap-1 justify-between">
                                <span>{{ status.completed ? `${(status.completed / 1024 / 1024).toFixed(2)}
                                    MB/${((status.total ??
                                        0) / 1024 / 1024).toFixed(2)} MB` : 'Waiting...' }}</span>
                                <span>{{ Math.round((status.completed ? status.completed / (status.total ?? 0) : 0) * 100)
                                    }}%</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <progress
                        class="bg-background w-full h-8 rounded-md"
                        :max="status.total" 
                        :value="status.completed">32%</progress>
                    <ButtonPrimary
                        text="Cancel" 
                        :icon="BiStopCircle" 
                        @click="downloadsStore.cancelDownload(modelName)" />
                </div>
            </div>
        </div>
        <div 
            v-else
            class="text-center mt-8">
            No models currently downloading
        </div>
    </ViewerContainer>
</template>