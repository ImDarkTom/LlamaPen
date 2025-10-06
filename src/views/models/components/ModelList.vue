<script setup lang="ts">
import PrimaryButton from '@/components/Buttons/PrimaryButton.vue';
import MemoryLoadIcon from '@/components/Icon/MemoryLoadIcon.vue';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import TextDivider from '@/components/TextDivider/TextDivider.vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import { useConfigStore } from '@/stores/config';
import { BiDownload, BiHide, BiLinkExternal } from 'vue-icons-plus/bi';

const config = useConfigStore();
const { connectedToOllama } = useModelList();

defineProps<{
    modelsList: ModelInfoListItem[],
}>();
</script>

<template>
    <div
        class="h-4/12 md:h-full w-full md:w-2/6 bg-background-light rounded-lg md:rounded-r-none md:border-r-1 border-border flex flex-col gap-2 p-2 relative" >
            <div class="flex flex-col gap-2 overflow-y-auto md:pr-3">
                <template v-if="!config.api.enabled">
                    <TextDivider text="Download" />
                    <PrimaryButton 
                        class="w-full"
                        text="Find models" 
                        :icon="BiLinkExternal" 
                        type="external-link" 
                        href="https://ollama.com/search" />
                        <RouterLink to="/models/downloads" v-slot="{ isActive }">
                            <button
                            class="w-full text-text-muted enabled:hover:text-text bg-surface enabled:hover:bg-surface-light py-6 rounded-lg enabled:cursor-pointer select-none flex flex-row justify-center items-center gap-2 disabled:opacity-75"
                            :class="{ 'bg-surface-light ring-2 ring-border ring-inset': isActive }"
                            :disabled="!connectedToOllama">
                            <BiDownload />
                            Download Manager
                        </button>
                    </RouterLink>
                </template>
                
                <TextDivider text="Models" />

                <div v-if="!connectedToOllama">
                    Not connected to Ollama
                </div>
                <div v-else-if="modelsList.length === 0">
                    No models found
                </div>
                <RouterLink
                    v-for="{ modelData, loadedInMemory, hidden, displayName } in modelsList" 
                    exactActiveClass="*:bg-surface-light *:ring-1 *:ring-highlight *:ring-inset *:text-text"
                    :to="`/models/${modelData.model}`" >
                    <div class="flex flex-row items-center gap-2 p-4 rounded-md hover:bg-surface transition-colors duration-dynamic">
                        <ModelIcon :name="modelData.model ?? 'Unknown'" class="size-6" />
                        {{ displayName }}

                        <div class="grow"></div>
                        <Tooltip v-if="hidden" text="Hidden in list"
                            class="flex items-center justify-center">
                            <BiHide class="h-full" />
                        </Tooltip>
                        <Tooltip v-if="loadedInMemory" text="Loaded in memory"
                            class="flex items-center justify-center">
                            <MemoryLoadIcon class="h-full" />
                        </Tooltip>
                    </div>
                </RouterLink>
            </div>
        </div>
</template>