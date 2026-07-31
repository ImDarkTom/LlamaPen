<script setup lang="ts">
import type { ModelLibraryResponse } from '@/stores/useOllamaModelLibrary';
import { BiCloudDownload, BiDownload, BiLinkExternal, BiListPlus, BiPlus, BiPurchaseTagAlt } from 'vue-icons-plus/bi';

defineProps<{
    model: ModelLibraryResponse[number];
}>();

const emit = defineEmits<{
    selectModel: [string];
}>();

const selectModel = (modelVariant: string) => emit('selectModel', modelVariant);
</script>

<template>
    <li class="py-4 flex flex-row gap-2 not-last:border-b border-base-500">
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
                class="font-semibold hover:underline inline-flex">
                {{ model.model }}
                <BiLinkExternal class="size-3 text-base-500" />
            </a>
            <p class="text-sm max-h-18 overflow-y-auto">
                {{ model.description ? model.description : '(No description)' }}
            </p>
            <div class="flex flex-row gap-2 mt-2">
                <BrowsePageItemPill tooltip="Pull Count">
                    <BiDownload class="size-4" />
                    {{ model.pullCount }}
                </BrowsePageItemPill>
                <BrowsePageItemPill tooltip="Last Updated">
                    <BiListPlus class="size-4" />
                    {{ new Date(model.lastUpdated).toLocaleDateString() }}
                </BrowsePageItemPill>
                <BrowsePageItemPill tooltip="Tag Count">
                    <BiPurchaseTagAlt class="size-4" />
                    {{ model.tagCount }}
                </BrowsePageItemPill>
            </div>
            <div class="flex flex-row gap-2 mt-2">
                <span
                    v-for="capability in model.capabilities"
                    :key="capability"
                    class="capitalize text-xs font-medium flex flex-row items-center gap-1 ring-inset ring-1 py-0.5 px-2 rounded-full"
                    :class="{
                        'bg-capability-audio/40 ring-capability-audio text-cyan-200': capability === 'audio',
                        'bg-capability-completion/40 ring-capability-completion text-teal-200':
                            capability === 'completion',
                        'bg-capability-reasoning/40 ring-capability-reasoning text-violet-200':
                            capability === 'thinking',
                        'bg-capability-tools/40 ring-capability-tools text-blue-200': capability === 'tools',
                        'bg-capability-vision/40 ring-capability-vision text-green-200': capability === 'vision',
                    }">
                    {{ capability }}
                </span>
            </div>
            <div class="text-sm font-medium flex flex-row gap-2 mt-2 overflow-auto max-w-full">
                <button
                    v-if="model.hasCloud"
                    class="bg-base-700 hover:bg-base-600 rounded-full p-1 px-3 flex items-center justify-center flex-row gap-1 cursor-pointer select-none ring-inset ring-1 ring-base-600"
                    @click="selectModel(`${model.model}:cloud`)">
                    <BiPlus />
                    Cloud
                </button>
                <button
                    v-for="size in model.sizes"
                    class="bg-base-700 hover:bg-base-600 rounded-full p-1 px-3 flex items-center justify-center flex-row gap-1 cursor-pointer select-none ring-inset ring-1 ring-base-600"
                    :key="size"
                    @click="selectModel(`${model.model}:${size}`)">
                    <BiCloudDownload />
                    {{ size }}
                </button>
            </div>
        </div>
    </li>
</template>
