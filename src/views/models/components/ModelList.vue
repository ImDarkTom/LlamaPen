<script setup lang="ts">
import PrimaryButton from '@/components/Buttons/PrimaryButton.vue';
import ActionMenu, { type MenuEntry } from '@/components/FloatingMenu/ActionMenu.vue';
import MemoryLoadIcon from '@/components/Icon/MemoryLoadIcon.vue';
import MemoryUnloadIcon from '@/components/Icon/MemoryUnloadIcon.vue';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import TextDivider from '@/components/TextDivider/TextDivider.vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import router from '@/lib/router';
import { useConfigStore } from '@/stores/config';
// import useUserStore from '@/stores/user';
import { computed, ref } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiCopy, BiDotsVerticalRounded, BiDownload, BiHide, BiLinkExternal, BiPencil, BiShow, BiTrash } from 'vue-icons-plus/bi';
import { Fa6Memory } from 'vue-icons-plus/fa6';
import { useProviderManager } from '@/composables/useProviderManager';
import { ollamaWrapper } from '@/providers/ollama/OllamaWrapper';
import type { Model } from '@/providers/base/types';

const config = useConfigStore();
const { setModelHidden } = useModelList();
const { rawModels, modelIds } = useModelList();
const { isConnected, isLoading } = useProviderManager();
// const user = useUserStore();

const props = defineProps<{
    modelsList: ModelInfoListItem[],
}>();

const emit = defineEmits<{
    refreshModelList: [];
}>();

const refreshModelList = () => emit('refreshModelList');

const isHidden = (modelName: string) => config.chat.hiddenModels.includes(modelName);
const isLoadedInMemory = (modelName: string) => rawModels.value.some(item => item.modelData.id === modelName && item.loadedInMemory);

const modelActions: MenuEntry<{ modelData: Model, displayName: string }>[] = [
    {
        text: 'Open in Ollama Library',
        icon: BiLinkExternal,
        onClick: ({ modelData }) => window.open(`https://ollama.com/library/${modelData.id}`, '_blank'),
        condition: !config.cloud.enabled
    },
    {
        text: ({ modelData }) => isHidden(modelData.id) ? 'Unhide model' : 'Hide model',
        onClick: ({ modelData }) => setModelHidden(modelData.id, isHidden(modelData.id)),
        icon: {
            type: 'factory',
            func: ({ modelData }) => isHidden(modelData.id) ? BiShow : BiHide
        },
    },
    {
        text: ({ modelData }) => isLoadedInMemory(modelData.id) ? 'Unload from memory' : 'Load into memory',
        onClick: ({ modelData }) => toggleModelLoaded(modelData.id),
        icon: {
            type: 'factory',
            func: ({ modelData }) => (isLoadedInMemory(modelData.id) ? MemoryUnloadIcon : Fa6Memory) as IconType
        },
        condition: !config.cloud.enabled
    },
    {
        text: 'Rename',
        icon: BiPencil,
        onClick: ({ modelData, displayName }) => renameModel(modelData, displayName),
    },
    {
        text: 'Duplicate model',
        icon: BiCopy,
        onClick: ({ modelData }) => copyModel(modelData.id),
        condition: !config.cloud.enabled
    },
    {
        text: 'Delete model',
        icon: BiTrash,
        onClick: ({ modelData }) => deleteModel(modelData.id),
        condition: !config.cloud.enabled,
        category: 'danger'
    }
];

async function toggleModelLoaded(modelName: string) {
    if (isLoadedInMemory(modelName)) {
        await useProviderManager().unloadModel(modelName);
        refreshModelList();
    } else {
        const success = await useProviderManager().loadModelIntoMemory(modelName);

        if (!success) {
            alert(`Failed to load model "${modelName}".`);
            return;
        }

        refreshModelList();
    }
}

async function renameModel(modelData: Model, displayName: string) {
    let newName = prompt(`Enter a new name for '${displayName}' (app cosmetic only): '`, displayName);
    if (newName === '' || !newName) {
        newName = displayName;
    }

    config.chat.modelRenames[modelData.id] = newName;
    refreshModelList();
}

async function copyModel(model: string) {
    const destination = prompt('Enter name for the new model copy:', `${model}-copy`);

    if (!destination || destination.trim() === '') {
        alert('Invalid new model name.');
        return;
    }

    const success = ollamaWrapper.copy({
        source: model,
        destination,
    });

    if (!success) {
        alert('Failed to copy model.');
        return;
    }

    refreshModelList();
}

async function deleteModel(model: string) {
    if (!confirm(`Are you sure you want to delete the model "${model}"? This action cannot be undone.`)) {
        return;
    }

    const success = await ollamaWrapper.delete({
        model,
    });

    if (!success) {
        alert('Failed to delete model.');
        return;
    }

    router.push('/models');
    refreshModelList();
}

const showAll = () => {
    config.chat.hiddenModels = [];
    refreshModelList();
};
const hideAll = () => {
    config.chat.hiddenModels = modelIds.value;
    refreshModelList();
};

// const showProprietaryModels = ref(user.userInfo.options.showProprietaryModels);

const searchQuery = ref('');

const queriedModels = computed(() => props.modelsList.filter((m) => {
    // TODO(llamapen-cloud): fix this 
    // if (!showProprietaryModels.value && m.modelData.llamapenMetadata?.tags?.includes('closedSource')) {
    //     return false;
    // }

    return m.displayName.includes(searchQuery.value) ||
        m.modelData.id.includes(searchQuery.value)
}));

const batchActions: MenuEntry[] = [
    {
        text: 'Hide all',
        icon: BiHide,
        onClick: hideAll
    },
    {
        text: 'Show all',
        icon: BiShow,
        onClick: showAll,
    },
];
</script>

<template>
    <div
        class="h-4/12 md:h-full w-full md:w-2/6 bg-background-light rounded-lg md:rounded-r-none md:border-r border-border flex flex-col gap-2 p-2 relative" >
            <div class="flex flex-col gap-2 overflow-y-auto md:pr-3">
                <template v-if="!config.cloud.enabled">
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
                            :disabled="!isConnected">
                            <BiDownload />
                            Download Manager
                        </button>
                    </RouterLink>
                </template>
                
                <TextDivider text="Models" />
                
                <div 
                    class="flex flex-row gap-2"
                    :class="{ 'pointer-events-none': !isConnected }">
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Search..."
                        :disabled="!isConnected"
                        class="bg-background p-2 rounded-md outline-none focus:ring-1 ring-highlight ring-inset w-full">
                    <ActionMenu :actions="batchActions">
                        <button class="btn-ghost">
                            <BiDotsVerticalRounded />
                        </button>
                    </ActionMenu>
                </div>

                <div v-if="!isConnected && !isLoading">
                    Not connected to Ollama
                </div>
                <div v-else-if="modelsList.length === 0">
                    No models found
                </div>
                <RouterLink
                    v-for="{ modelData, loadedInMemory, hidden, displayName } in queriedModels" 
                    exactActiveClass="*:bg-surface-light *:ring-1 *:ring-highlight *:ring-inset *:text-text"
                    :to="`/models/${modelData.id}`" >
                    <div 
                        class="flex flex-row items-center gap-2 p-2 rounded-md hover:bg-surface transition-colors duration-dynamic"
                        :class="{ 'opacity-75': hidden }">
                        <ModelIcon :name="modelData.id ?? 'Unknown'" class="size-6" />
                        {{ displayName }}

                        <div class="grow"></div>
                        <Tooltip v-if="hidden" text="Hidden"
                            class="flex items-center justify-center">
                            <BiHide class="h-full" />
                        </Tooltip>
                        <Tooltip v-if="loadedInMemory" text="Loaded in memory"
                            class="flex items-center justify-center">
                            <MemoryLoadIcon class="h-full" />
                        </Tooltip>
                        <ActionMenu :passArgs="{ modelData, displayName }" :actions="modelActions" anchored="left">
                            <button @click.prevent class="hover:bg-surface-light group-[.active]:bg-surface-light group-[.active]:text-text p-1.5 rounded-sm cursor-pointer">
                                <BiDotsVerticalRounded />
                            </button>
                        </ActionMenu>
                    </div>
                </RouterLink>
            </div>
        </div>
</template>