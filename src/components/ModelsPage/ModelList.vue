<script setup lang="ts">
import router from '@/lib/router';
import { useConfigStore } from '@/stores/config';
import useCloudUserStore from '@/stores/useCloudUserStore';
import { computed, ref } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiCopy, BiDotsVerticalRounded, BiDownload, BiHide, BiLinkExternal, BiPencil, BiShow, BiTrash } from 'vue-icons-plus/bi';
import { Fa6Memory } from 'vue-icons-plus/fa6';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';
import { ollamaWrapper } from '@/providers/ollama/OllamaWrapper';
import type { Model } from '@/providers/base/types';
import useUIStore from '@/stores/uiStore';
// This has to be imported as we are using it programatically
import IconMemoryUnload from '@/components/Icon/MemoryUnload.vue';

const config = useConfigStore();
const { setModelHidden } = useUIStore();
const { rawModels } = useProviderManager();
const { isConnected, isLoading, allModelIds, isOllama } = useProviderManager();
const cloudUserStore = useCloudUserStore();

const props = defineProps<{
    modelsList: ModelInfo[],
}>();

const emit = defineEmits<{
    refreshModelList: [];
}>();

const refreshModelList = () => emit('refreshModelList');

const isHidden = (modelName: string) => config.chat.hiddenModels.includes(modelName);
const isLoadedInMemory = (modelName: string) => rawModels.value.some(item => item.info.id === modelName && item.loadedInMemory);

const modelActions: MenuEntry<{ modelData: Model, displayName: string }>[] = [
    {
        type: 'text',
        text: 'Open in Ollama Library',
        icon: BiLinkExternal,
        onClick: ({ modelData }) => window.open(`https://ollama.com/library/${modelData.id}`, '_blank'),
        condition: isOllama.value
    },
    {
        type: 'text',
        text: ({ modelData }) => isLoadedInMemory(modelData.id) ? 'Unload from memory' : 'Load into memory',
        onClick: ({ modelData }) => toggleModelLoaded(modelData.id),
        icon: {
            type: 'factory',
            func: ({ modelData }: { modelData: Model }) => (isLoadedInMemory(modelData.id) ? IconMemoryUnload : Fa6Memory) as IconType
        },
        condition: isOllama.value
    },
    {
        type: 'divider',
        condition: isOllama.value,
    },
    {
        type: 'text',
        text: ({ modelData }) => isHidden(modelData.id) ? 'Unhide model' : 'Hide model',
        onClick: ({ modelData }) => setModelHidden(modelData.id, isHidden(modelData.id)),
        icon: {
            type: 'factory',
            func: ({ modelData }: { modelData: Model }) => isHidden(modelData.id) ? BiShow : BiHide
        },
    },
    {
        type: 'text',
        text: 'Rename',
        icon: BiPencil,
        onClick: ({ modelData, displayName }) => renameModel(modelData, displayName),
    },
    {
        type: 'text',
        text: 'Duplicate model',
        icon: BiCopy,
        onClick: ({ modelData }) => copyModel(modelData.id),
        condition: isOllama.value
    },
    {
        type: 'text',
        text: 'Delete model',
        icon: BiTrash,
        onClick: ({ modelData }) => deleteModel(modelData.id),
        condition: isOllama.value,
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
    config.chat.hiddenModels = allModelIds.value;
    refreshModelList();
};

const showProprietaryModels = ref(cloudUserStore.userInfo.options.showProprietaryModels);

const searchQuery = ref('');

const queriedModels = computed(() => props.modelsList.filter((m) => {
    if (!showProprietaryModels.value && m.info.providerMetadata?.provider === 'lpcloud' && m.info.providerMetadata.data.tags?.includes('closedSource')) {
        return false;
    }

    return m.displayName.includes(searchQuery.value) ||
        m.info.id.includes(searchQuery.value)
}));

const batchActions: MenuEntry[] = [
    {
        type: 'text',
        text: 'Hide all',
        icon: BiHide,
        onClick: hideAll
    },
    {
        type: 'text',
        text: 'Show all',
        icon: BiShow,
        onClick: showAll,
    },
];
</script>

<template>
    <div
        class="h-4/12 md:h-full w-full md:w-2/6 rounded-lg md:rounded-r-none md:border-r border-base-400 flex flex-col gap-2 p-2 relative">
        <div class="flex flex-col gap-2 overflow-y-auto md:pr-3">
            <template v-if="!config.cloud.enabled">
                <UITextDivider text="Download" />
                <a 
                    href="https://ollama.com/search"
                    target="_blank"
                    rel="noopener noreferrer">
                    <button
                        class="w-full text-base-900 hover:text-base-950 bg-primary hover:bg-secondary py-2 rounded-lg cursor-pointer select-none flex flex-row justify-center items-center">
                        <IconOllama class="size-4 mr-2" />
                        Find models
                        <BiLinkExternal class="size-3 ml-1 mb-auto" />
                    </button>
                </a>
                <RouterLink to="/models/downloads" v-slot="{ isActive }">
                    <button
                        class="w-full text-base-200 enabled:hover:text-base-100 bg-base-700 enabled:hover:bg-base-600 py-2 rounded-lg enabled:cursor-pointer select-none flex flex-row justify-center items-center gap-2 disabled:opacity-75"
                        :class="{ 'bg-base-600 ring-2 ring-base-400 ring-inset': isActive }"
                        :disabled="!isConnected">
                        <BiDownload class="size-4" />
                        Downloads
                    </button>
                </RouterLink>
            </template>

            <UITextDivider text="Models" />

            <div class="flex flex-row gap-2" :class="{ 'pointer-events-none': !isConnected }">
                <input type="text" v-model="searchQuery" placeholder="Search..." :disabled="!isConnected"
                    class="bg-base-900 p-2 rounded-md outline-none focus:ring-1 ring-base-300 ring-inset w-full">
                <FloatingActionMenu :actions="batchActions">
                    <button class="btn-ghost">
                        <BiDotsVerticalRounded />
                    </button>
                </FloatingActionMenu>
            </div>

            <div v-if="!isConnected && !isLoading">
                Not connected to Ollama
            </div>
            <div v-else-if="modelsList.length === 0">
                No models found
            </div>
            <RouterLink v-for="{ info, loadedInMemory, hidden, displayName } in queriedModels"
                exactActiveClass="*:bg-base-600 *:ring-1 *:ring-base-300 *:ring-inset *:text-base-100"
                :to="`/models/${info.id}`">
                <div class="flex flex-row items-center gap-2 p-2 rounded-md hover:bg-base-700 transition-colors duration-dynamic"
                    :class="{ 'opacity-75': hidden }">
                    <IconModel :name="info.id ?? 'Unknown'" class="size-6" />
                    {{ displayName }}

                    <div class="grow"></div>
                    <Tooltip v-if="hidden" text="Hidden" class="flex items-center justify-center">
                        <BiHide class="h-full" />
                    </Tooltip>
                    <Tooltip v-if="loadedInMemory" text="Loaded in memory" class="flex items-center justify-center">
                        <IconMemoryLoad class="h-full" />
                    </Tooltip>
                    <FloatingActionMenu :passArgs="{ modelData: info, displayName }" :actions="modelActions"
                        anchored="left">
                        <button @click.prevent
                            class="hover:bg-base-600 group-[.active]:bg-base-600 group-[.active]:text-base-100 p-1.5 rounded-sm cursor-pointer">
                            <BiDotsVerticalRounded />
                        </button>
                    </FloatingActionMenu>
                </div>
            </RouterLink>
        </div>
    </div>
</template>