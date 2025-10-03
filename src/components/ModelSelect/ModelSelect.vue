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
import { AiOutlineEye, AiOutlineLoading } from 'vue-icons-plus/ai';
import PrimaryButton from '../Buttons/PrimaryButton.vue';
import { BiBrain, BiFilterAlt, BiRefresh, BiWrench } from 'vue-icons-plus/bi';
import MultiItemSelect from './MultiItemSelect.vue';
import FloatingMenuTest from '../FloatingMenu/FloatingMenuTest.vue';

const config = useConfigStore();
const { getModelCapabilities } = useModelList();

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
        .filter((model) => {
            const query = (searchQuery.value || "").toLowerCase();

            return (
                model.modelData.name.toLowerCase().includes(query) ||
                model.displayName.toLowerCase().includes(query) ||
                model.modelData.model.toLowerCase().includes(query)
            );
        });
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
        
        case "/":
            e.preventDefault();
            filterMenuOpen.value = true;

            nextTick(() => {
                orderBySelect.value?.focus();
            });
            
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
    if (!selectedModelInfo.value.exists) return "No model selected.";
    
    return selectedModelInfo.value.data.displayName;
});

const orderBySelect = ref<HTMLSelectElement | null>(null);
const filterMenuOpen = ref(false);

function toggleFilterMenu() {
    filterMenuOpen.value = !filterMenuOpen.value;
}

const orderBy = ref<'default' | 'alphabetically' | 'size'>('default');
const filterCapabilities = ref<OllamaCapability[]>([]);

function userSort(items: ModelInfoListItem[]) {
    if (filterCapabilities.value.length > 0) {
        items = items.filter((item) => {
            const capabilities = getModelCapabilities(item);
            return filterCapabilities.value.every((cap) => capabilities.includes(cap));
        });
    };

    switch (orderBy.value) {
        case 'default':
            break;
        
        case 'alphabetically':
            items = items.sort((a, b) => {
                const item1 = a.modelData.model.split('/')[1] ?? a.modelData.model;
                const item2 = b.modelData.model.split('/')[1] ?? b.modelData.model;

                return item1.localeCompare(item2, undefined, { sensitivity: 'base' });
            });
            break;

        case 'size':
            items = items.sort((a, b) => a.modelData.size - b.modelData.size);
            break;
    }

    return items;
}
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
                <button
                    @click="toggleFilterMenu"
                    :class="{ 'hover:!bg-border': filterMenuOpen }"
                    class="h6 p-3 text-background bg-primary hover:!bg-border cursor-pointer transition-colors duration-dynamic rounded-lg">
                    <BiFilterAlt />
                </button>
                <RouterLink to="/models"
                    class="h-6 p-3 box-content text-background !bg-primary hover:!bg-border cursor-pointer transition-colors duration-dynamic rounded-lg">
                    <TbListDetails />
                </RouterLink>
            </div>

            <div v-if="filterMenuOpen" class="max-h-16 relative flex flex-row gap-2 overflow-y-visible">
                <div class="flex flex-col justify-end">
                    <!-- <button 
                        class="bg-surface-light p-2 rounded-md ring-inset ring-2 ring-border-muted h-min"
                        @click="filterCapabilities = []; orderBy = 'default'">
                        <BiRefresh class="size-5" />
                    </button> -->
                </div>
                <label class="flex flex-col">
                    <span>Filter:</span>
                    <MultiItemSelect 
                        v-model="filterCapabilities"
                        :items="[
                            {
                                label: 'Thinking',
                                value: 'thinking',
                                icon: BiBrain,
                            },
                            {
                                label: 'Vision',
                                value: 'vision',
                                icon: AiOutlineEye,
                            },
                            {
                                label: 'Tools',
                                value: 'tools',
                                icon: BiWrench,
                            }
                        ]"
                        button-class="bg-surface-light w-full p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0 line-clamp-1 "
                        menu-class="bg-surface w-full min-w-fit p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0 max-h-48 overflow-y-auto"
                        item-class="p-1 rounded-md hover:bg-surface-light"
                        selected-item-class="bg-primary! text-background" />
                </label>
                <label class="flex flex-col">
                    <span>Order:</span>
                    <select 
                        v-model="orderBy" 
                        ref="orderBySelect"
                        class="bg-surface-light p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0">
                        <option value="default">Default ({{ config.api.enabled ? 'Creator Name' : 'Added date' }})</option>
                        <option value="alphabetically">Alphabetically</option>
                        <option value="size">Size</option>
                    </select>
                </label>
            </div>

            <ul role="list" :class="{ 'max-h-64!': filterMenuOpen }" class="max-h-80 overflow-y-auto [scrollbar-width:thin] *:not-last:mb-2">
                <li v-if="modelsLoading" class="h-24 flex justify-center items-center">
                    <AiOutlineLoading class="animate-spin size-6" />
                </li>
                <li v-else-if="!connectedToOllama" class="h-24 flex flex-col px-3 py-2 justify-center items-center font-bold gap-2">
                    <span>
                        <VscDebugDisconnect class="inline" />
                        Not connected to Ollama.
                    </span>
                    <PrimaryButton
                        type="button"
                        color="primary"
                        text="Retry"
                        :icon="BiRefresh"
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
                    v-for="(model, index) in userSort(queriedModelList.filter((item) => !item.hidden))" 
                    :key="model.modelData.model" 
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