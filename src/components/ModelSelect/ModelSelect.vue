<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue';
import { useConfigStore } from '../../stores/config';
import { VscDebugDisconnect } from 'vue-icons-plus/vsc';
import ModelSelectItem from './ModelSelectItem.vue';
import logger from '@/lib/logger';
import ModelIcon from '../Icon/ModelIcon.vue';
import { TbListDetails } from 'vue-icons-plus/tb';
import isOnMobile from '@/utils/core/isOnMobile';
import Dropdown from '../Dropdown/Dropdown.vue';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import { AiOutlineLoading, AiOutlineReload } from 'vue-icons-plus/ai';
import PrimaryButton from '../Buttons/PrimaryButton.vue';

const config = useConfigStore();

// State
const { 
    models: modelsList, 
    modelIds, 
    load: loadModels, 
    selectedModelInfo, 
    loading: modelsLoading,
    connectedToOllama
} = useModelList();

// UI State
const searchQuery = ref<string>('');
const searchFocused = ref<boolean>(false);
const focusedItemIndex = ref<number>(0);

// Refs
const dropdownRef = ref<ComponentPublicInstance & { toggleOpened: () => void } | null>(null);
const searchBarRef = ref<HTMLInputElement | null>(null);
const listItemsRef = ref<Array<ComponentPublicInstance<{ listItemRef: HTMLLIElement | null }>>>([]);

// Lifecycle hooks
onMounted(async () => {
    logger.info('Model Select Component', 'Selected model is', config.selectedModel);

    await loadModels();
    if (selectedModelInfo.value.exists) {
        setModel(
            selectedModelInfo.value.data.modelData, 
            true
        );
    } else {
        config.selectedModel = modelIds.value[0];
        setModel(modelsList.value[0].modelData, true);
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyboardShortcuts);
});

// Computed properties
const queriedModelList = computed<ModelInfoListItem[]>(() => {
    return modelsList.value
        .filter((item) => item.modelData.name.toLowerCase().includes((searchQuery.value || "").toLowerCase()));
});

// Functions
function handleKeyboardShortcuts(e: KeyboardEvent) {
    if (e.key === "M" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();

        if (dropdownRef.value) {
            dropdownRef.value.toggleOpened();
        }
    }
}

async function setModel(newModel: ModelListItem, skipUiUpdate: boolean = false) {
    const newModelId = newModel.model;
    config.selectedModel = newModelId;

    if (!skipUiUpdate) {
        if (dropdownRef.value) {
            dropdownRef.value.toggleOpened();
        }
        searchQuery.value = "";
    };
}

function resetState() {
    searchQuery.value = "";
    focusedItemIndex.value = 0;
}

function onToggled(opened: boolean) {
    if (opened) {
        nextTick(() => {
            // QOL change for mobile users so keyboard doesn't pop up
            if (!isOnMobile()) {
                searchBarRef.value?.focus();
            } else {
                searchBarRef.value?.blur();
            }

            const selectedItem = listItemsRef.value[focusedItemIndex.value];
            selectedItem?.listItemRef?.scrollIntoView({ block: 'center' });
        });
    }
}

function searchKeyDown(e: KeyboardEvent) {
    let scrollDown = false;
    switch (e.key) {
        case "Enter":
            setModel(queriedModelList.value[focusedItemIndex.value].modelData);
            break;

        case "Escape":
            if (dropdownRef.value) {
                dropdownRef.value.toggleOpened();
            }
            resetState();
            break;

        case "ArrowUp":
            focusedItemIndex.value = Math.max(focusedItemIndex.value - 1, 0); // back 1 index or keep at 0
            scrollDown = true;
            break;

        case "ArrowDown":
            focusedItemIndex.value = Math.min(focusedItemIndex.value + 1, queriedModelList.value.length - 1); // up 1 index or keep at max
            scrollDown = true;
            break;

        default:
            focusedItemIndex.value = 0;
            break;
    }

    if (scrollDown) {
        nextTick(() => {
            const selectedItem = listItemsRef.value[focusedItemIndex.value];
            selectedItem?.listItemRef?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
    }
}

defineProps<{
    direction: 'up' | 'down',
}>();

function setFocused(index: number) {
    focusedItemIndex.value = index;
}

const modelName = computed(() => {
    return selectedModelInfo.value.data?.modelData.name || config.selectedModel;
});
</script>

<template>
    <Dropdown :direction @opened="onToggled" ref="dropdownRef">
        <template #button>
            <span v-if="modelsLoading" class="flex flex-row gap-2 items-center text-text-muted/75">
                <AiOutlineLoading class="animate-spin size-6 inline" />
                Loading models...
            </span>

            <span v-else-if="connectedToOllama && selectedModelInfo.exists" class="flex flex-row gap-2 items-center">
                <ModelIcon :name="selectedModelInfo.data.modelData.model" class="size-6" />
                {{ modelName }}
            </span>

            <span v-else-if="connectedToOllama">
                No model selected
            </span>

            <span v-else class="flex flex-row gap-2 items-center text-text-muted/75">
                <VscDebugDisconnect />
                Disconnected
            </span>
        </template>
        <template #menu>
            <div class="flex flex-row gap-2 items-center justify-center" role="listbox">
                <!-- Search bar -->
                <input 
                    class="border-2 border-primary focus:border-border w-full rounded-lg h-6 box-content p-3 outline-0"
                    :class="{ 'cursor-not-allowed': !connectedToOllama }" 
                    ref="searchBarRef" 
                    type="search"
                    placeholder="Search a model..."
                    :disabled="!connectedToOllama"
                    v-model="searchQuery" 
                    @focus="searchFocused = true"
                    @blur="searchFocused = false" 
                    @keydown="searchKeyDown" 
                    aria-label="Search for a model..."
                    aria-controls="model-list" >
                <RouterLink to="/models"
                    class="h-6 p-3 box-content text-background !bg-primary hover:!bg-border cursor-pointer transition-colors duration-dynamic rounded-lg">
                    <TbListDetails />
                </RouterLink>
            </div>

            <ul role="list" class="max-h-80 overflow-y-auto [scrollbar-width:thin] *:not-last:mb-2">
                <li v-if="!connectedToOllama" class="h-24 flex flex-col px-3 py-2 roundex-xl justify-center items-center font-bold gap-2">
                    <span>
                        <VscDebugDisconnect class="inline" />
                        Not connected to Ollama.
                    </span>
                    <PrimaryButton
                        type="button"
                        color="primary"
                        text="Retry"
                        :icon="AiOutlineReload"
                        @click="loadModels(true)"
                    />
                </li>
                <li v-else-if="queriedModelList.length === 0 && searchQuery !== ''"
                    class="flex w-full p-4 justify-center items-center">
                    No results.
                </li>
                <li v-else-if="queriedModelList.length === 0 && searchQuery === ''"
                    class="flex flex-col w-full p-4 justify-center items-center">
                    <span>No models found.</span>
                    <a href="https://ollama.com/search" target="_blank" class="text-secondary hover:underline">Search on Ollama</a>
                </li>
                <ModelSelectItem 
                    v-else-if="queriedModelList.filter((item) => !item.hidden).length > 0"
                    v-for="(model, index) in queriedModelList.filter((item) => !item.hidden)" 
                    :key="model.modelData.name" 
                    :index="index"
                    :model="model" 
                    :isCurrentModel="model.modelData.model === selectedModelInfo.data?.modelData.model" 
                    :selected="index === focusedItemIndex"
                    @setModel="setModel" 
                    @mouseover="setFocused(index)"
                    ref="listItemsRef" />
                <li v-else class="flex flex-col w-full p-4 justify-center items-center">
                    <span>No unhidden models found. </span>
                </li>
            </ul>
        </template>
    </Dropdown>
</template>