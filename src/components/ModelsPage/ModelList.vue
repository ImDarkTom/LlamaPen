<script setup lang="ts">
import router from '@/lib/router';
import { useConfigStore } from '@/stores/config';
import useUserStore from '@/stores/user';
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
const userStore = useUserStore();

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
        text: ({ modelData }) => isHidden(modelData.id) ? 'Unhide model' : 'Hide model',
        onClick: ({ modelData }) => setModelHidden(modelData.id, isHidden(modelData.id)),
        icon: {
            type: 'factory',
            func: ({ modelData }: { modelData: Model }) => isHidden(modelData.id) ? BiShow : BiHide
        },
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

const showProprietaryModels = ref(userStore.userInfo.options.showProprietaryModels);

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
        class="h-4/12 md:h-full w-full md:w-2/6 bg-background-light rounded-lg md:rounded-r-none md:border-r border-border flex flex-col gap-2 p-2 relative">
        <div class="flex flex-col gap-2 overflow-y-auto md:pr-3">
            <template v-if="!config.cloud.enabled">
                <UITextDivider text="Download" />
                <ButtonPrimary class="w-full" text="Find models" :icon="BiLinkExternal" type="external-link"
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

            <UITextDivider text="Models" />

            <div class="flex flex-row gap-2" :class="{ 'pointer-events-none': !isConnected }">
                <input type="text" v-model="searchQuery" placeholder="Search..." :disabled="!isConnected"
                    class="bg-background p-2 rounded-md outline-none focus:ring-1 ring-highlight ring-inset w-full">
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
                exactActiveClass="*:bg-surface-light *:ring-1 *:ring-highlight *:ring-inset *:text-text"
                :to="`/models/${info.id}`">
                <div class="flex flex-row items-center gap-2 p-2 rounded-md hover:bg-surface transition-colors duration-dynamic"
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
                            class="hover:bg-surface-light group-[.active]:bg-surface-light group-[.active]:text-text p-1.5 rounded-sm cursor-pointer">
                            <BiDotsVerticalRounded />
                        </button>
                    </FloatingActionMenu>
                </div>
            </RouterLink>
        </div>
    </div>
</template>