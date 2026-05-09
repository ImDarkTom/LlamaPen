<script setup lang="ts">
import type { ModelLibraryResponse } from '@/stores/useOllamaModelLibrary';
import { BiCloudDownload, BiDownload, BiListPlus, BiPlus, BiPurchaseTagAlt } from 'vue-icons-plus/bi';

defineProps<{
    model: ModelLibraryResponse[number],
}>();

const emit = defineEmits<{
    selectModel: [ string ];
}>();

const selectModel = (modelVariant: string) => emit('selectModel', modelVariant);

</script>

<template>
    <li class="py-4 flex flex-row gap-2 border-b border-base-500">
        <div class="flex flex-col">
            <IconModel 
                :name="model.model"
                class="size-8" />
        </div>
        <div class="grow w-full min-w-0">
            <a
                :href="`https://ollama.com/library/${model.model}`"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold hover:underline">
                {{ model.model }}
            </a>
            <p class="text-sm">
                {{ model.description ? model.description : '(No description)' }}
            </p>
            <div class="flex flex-row gap-2 mt-2">
                <span class="text-xs font-medium flex flex-row items-center gap-1 bg-base-700 p-0.5 px-2 rounded-full">
                    <BiDownload class="size-4" />
                    {{ model.pullCount }}
                </span>
                <span class="text-xs font-medium flex flex-row items-center gap-1 bg-base-700 p-0.5 px-2 rounded-full">
                    <BiListPlus class="size-4" />
                    {{ new Date(model.lastUpdated).toLocaleDateString() }}
                </span>
                <span class="text-xs font-medium flex flex-row items-center gap-1 bg-base-700 p-0.5 px-2 rounded-full">
                    <BiPurchaseTagAlt class="size-4" />
                    {{ model.tagCount }}
                </span>
            </div>
            <div class="flex flex-row gap-2 mt-2 overflow-auto max-w-full">
                <button
                    v-if="model.hasCloud"
                    class="bg-base-700 hover:bg-base-500 rounded-full p-1 px-3 flex items-center flex-row gap-1 cursor-pointer select-none"
                    @click="selectModel(`${model.model}:cloud`)">
                    <BiPlus />
                    Cloud
                </button>
                <button
                    v-for="size in model.sizes"
                    class="bg-base-700 disabled:bg-base-800 disabled:text-base-400 not-disabled:hover:bg-base-500 rounded-full p-1 px-3 flex items-center flex-row gap-1 not-disabled:cursor-pointer select-none"
                    :key="size"
                    @click="selectModel(`${model.model}:${size}`)">
                    <BiCloudDownload />
                    {{ size }}
                </button>
            </div>
        </div>
    </li>
</template>