<script setup lang="ts">
import PrimaryButton from '@/components/Buttons/PrimaryButton.vue';
import MemoryLoadIcon from '@/components/Icon/MemoryLoadIcon.vue';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import { useConfigStore } from '@/stores/config';
import { BiLinkExternal } from 'vue-icons-plus/bi';
import { BsArrowLeft, BsDownload, BsEyeSlash } from 'vue-icons-plus/bs';

const config = useConfigStore();
const { connectedToOllama } = useModelList();

defineProps<{
    modelsList: ModelInfoListItem[],
}>();
</script>

<template>
    <div
        class="h-4/12 md:h-full w-full md:w-3/12 bg-background-light rounded-lg flex flex-col gap-2 p-2 relative"
        :class="{ 'cursor-not-allowed select-none overflow-hidden!': config.api.enabled }" >
            <!-- overlay -->
            <div v-if="config.api.enabled" class="w-full h-full absolute top-0 left-0 bg-black/50"></div>
            <RouterLink to="/"
                class="p-4 rounded-md flex flex-row items-center gap-2 font-semibold cursor-pointer hover:bg-surface! hover:text-text transition-colors duration-dynamic select-none">
                <BsArrowLeft class="size-6" />
                Back to Chat
            </RouterLink>

            <div class="h-[1px] w-full bg-border"></div>

            <div class="flex flex-col gap-2 overflow-y-auto">
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
                        <BsDownload />
                        Download Manager
                    </button>
                </RouterLink>

                <div class="h-[1px] w-full bg-border"></div>

                <div v-if="!connectedToOllama">
                    Not connected to Ollama
                </div>
                <div v-else-if="modelsList.length === 0">
                    No models found
                </div>
                <RouterLink 
                    v-else-if="!config.api.enabled" 
                    v-for="{ modelData, loadedInMemory, hidden, displayName } in modelsList" 
                    class="p-4 rounded-md flex flex-row items-center gap-2 hover:bg-surface! hover:text-text transition-all duration-dynamic"
                    exactActiveClass="!bg-surface-light ring-2 ring-border ring-inset"
                    :to="`/models/${modelData.model}`" >
                    <ModelIcon :name="modelData.model ?? 'Unknown'" class="size-6" />

                    {{ displayName }}

                    <div class="grow"></div>

                    <Tooltip v-if="hidden" text="Loaded in memory"
                        class="flex items-center justify-center">
                        <BsEyeSlash class="h-full" />
                    </Tooltip>
                    <Tooltip v-if="loadedInMemory" text="Loaded in memory"
                        class="flex items-center justify-center">
                        <MemoryLoadIcon class="h-full" />
                    </Tooltip>
                </RouterLink>
            </div>
        </div>
</template>