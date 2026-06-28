<script setup lang="ts">
import router from '@/lib/router';
import { useConfigStore } from '@/stores/useConfigStore';
import { computed, ref } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiCopy, BiDotsVerticalRounded, BiHide, BiLinkExternal, BiPencil, BiShow, BiTrash } from 'vue-icons-plus/bi';
import { Fa6Memory } from 'vue-icons-plus/fa6';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';
import { ollamaWrapper } from '@/providers/ollama/OllamaWrapper';
import useUIStore from '@/stores/useUiStore';
// This has to be imported as we are using it programatically
import IconMemoryUnload from '@/components/Icon/MemoryUnload.vue';

const config = useConfigStore();
const { setModelHidden } = useUIStore();
const { isConnected, isLoading, allModelIds, loadedModelIds, currentProvider } = useProviderManager();

const props = defineProps<{
    modelsList: ModelInfo[],
}>();

const emit = defineEmits<{
    refreshModelList: [];
}>();

const refreshModelList = () => emit('refreshModelList');

const isHidden = (modelId: string) => config.chat.hiddenModels.includes(modelId);
const isMemoryManaged = computed(() => currentProvider.value.capabilities.memoryManagement);
const isLoadedInMemory = (modelId: string) => loadedModelIds.value.has(modelId);

const modelActions: MenuEntry<{ modelId: string, displayName: string }>[] = [
    {
        type: 'text',
        text: 'Open in Ollama Library',
        icon: BiLinkExternal,
        onClick: ({ modelId }) => window.open(`https://ollama.com/library/${modelId}`, '_blank'),
        condition: isMemoryManaged.value
    },
    {
        type: 'text',
        text: ({ modelId }) => isLoadedInMemory(modelId) ? 'Unload from memory' : 'Load into memory',
        onClick: ({ modelId }) => toggleModelLoaded(modelId),
        icon: {
            type: 'factory',
            func: ({ modelId }: { modelId: string }) => (isLoadedInMemory(modelId) ? IconMemoryUnload : Fa6Memory) as IconType
        },
        condition: isMemoryManaged.value
    },
    {
        type: 'divider',
        condition: isMemoryManaged.value,
    },
    {
        type: 'text',
        text: ({ modelId }) => isHidden(modelId) ? 'Unhide model' : 'Hide model',
        onClick: ({ modelId }) => setModelHidden(modelId, isHidden(modelId)),
        icon: {
            type: 'factory',
            func: ({ modelId }: { modelId: string }) => isHidden(modelId) ? BiShow : BiHide
        },
    },
    {
        type: 'text',
        text: 'Rename',
        icon: BiPencil,
        onClick: ({ modelId, displayName }) => renameModel(modelId, displayName),
    },
    {
        type: 'text',
        text: 'Duplicate model',
        icon: BiCopy,
        onClick: ({ modelId }) => copyModel(modelId),
        condition: isMemoryManaged.value
    },
    {
        type: 'text',
        text: 'Delete model',
        icon: BiTrash,
        onClick: ({ modelId }) => deleteModel(modelId),
        condition: isMemoryManaged.value,
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

async function renameModel(modelId: string, displayName: string) {
    let newName = prompt(`Enter a new name for '${displayName}' (app cosmetic only): '`, displayName);
    if (newName === '' || !newName) {
        newName = displayName;
    }

    config.chat.modelRenames[modelId] = newName;
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

const searchQuery = ref('');

const queriedModels = computed(() => props.modelsList.filter((m) => {
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
    <div class="h-4/12 md:h-full w-full md:md:w-96 rounded-lg md:rounded-r-none flex flex-col gap-2 p-2 relative">
        <div class="flex flex-col gap-2 overflow-y-auto md:pr-3">
            <div class="flex flex-row gap-2" :class="{ 'pointer-events-none': !isConnected }">
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Search..." 
                    :disabled="!isConnected"
                    class="bg-base-800 p-2 rounded-md outline-none focus:ring-1 ring-base-300 ring-inset w-full">
                <FloatingActionMenu :actions="batchActions">
                    <button class="btn-ghost">
                        <BiDotsVerticalRounded />
                    </button>
                </FloatingActionMenu>
            </div>

            <div v-if="!isConnected && !isLoading">
                Not connected to '{{ currentProvider.name }}'
            </div>
            <div v-else-if="modelsList.length === 0">
                No models found
            </div>
            <div v-else-if="queriedModels.length === 0">
                No models match search
            </div>
            <RouterLink 
                v-for="{ info: { id: modelId }, hidden, displayName } in queriedModels"
                exactActiveClass="router-link-exact-active"
                :to="`/models/installed/${modelId}`"
                class="group"
                :class="{ 'opacity-75': hidden }">
                <div 
                    class="group-[.router-link-exact-active]:bg-base-950! flex flex-row items-center gap-2 p-2 rounded-md hover:bg-base-800">
                    <IconModel :name="modelId ?? 'Unknown'" class="size-6" />
                    <span class="text-sm font-medium">
                        {{ displayName }}
                    </span>
                    
                    <div class="grow"></div>
                    <Tooltip 
                        v-if="hidden" 
                        text="Hidden" 
                        class="flex items-center justify-center">
                        <BiHide class="h-full" />
                    </Tooltip>
                    <Tooltip 
                        v-if="isLoadedInMemory(modelId)" 
                        text="Loaded in memory" 
                        class="flex items-center justify-center">
                        <IconMemoryLoad class="h-full" />
                    </Tooltip>
                    <FloatingActionMenu 
                        anchored="left"
                        :passArgs="{ modelId, displayName }" 
                        :actions="modelActions">
                        <button @click.prevent
                            class="hover:bg-base-700 group-[.active]:bg-base-600 group-[.active]:text-base-100 p-1.5 rounded-sm cursor-pointer">
                            <BiDotsVerticalRounded />
                        </button>
                    </FloatingActionMenu>
                </div>
            </RouterLink>
        </div>
    </div>
</template>