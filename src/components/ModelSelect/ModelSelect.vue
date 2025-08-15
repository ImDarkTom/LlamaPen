<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue';
import { useConfigStore } from '../../stores/config';
import { useUiStore } from '../../stores/uiStore';
import { VscDebugDisconnect } from 'vue-icons-plus/vsc';
import ModelSelectItem from './ModelSelectItem.vue';
import logger from '@/lib/logger';
import ollamaApi from '@/utils/ollama';
import ModelIcon from '../Icon/ModelIcon.vue';
import { TbListDetails } from 'vue-icons-plus/tb';
import isOnMobile from '@/utils/core/isOnMobile';
import ollamaRequest from '@/utils/ollamaRequest';
import { useModelCapabiltyCache } from '@/composables/modelCapabilities';
import Dropdown from '../Dropdown/Dropdown.vue';

const config = useConfigStore();
const uiStore = useUiStore();

// State
const modelsList = ref<ModelList>([]);

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

    modelsList.value = await ollamaApi.getModels();

    if (!config.selectedModel || !modelsList.value.map((item) => item.model).includes(config.selectedModel)) {
        config.selectedModel = modelsList.value[0].model;
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyboardShortcuts);
});

// Computed properties
const queriedModelList = computed<ModelList>(() => {
    return modelsList.value.filter((model) => model.name.toLowerCase().includes((searchQuery.value || "").toLowerCase()));
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

async function setModel(newModelName: string) {
    config.selectedModel = newModelName;

    if (dropdownRef.value) {
        dropdownRef.value.toggleOpened();
    }
    searchQuery.value = "";

    const { data: response, error } = await ollamaRequest('/api/show', 'POST', {
        model: newModelName,
    });

    if (error) {
        console.error('Error getting model info for selected ollama model.', error);
        return
    }
    
    const modelInfo = (await response.json()) as OllamaModelInfoResponse;

    uiStore.chat.selectedModelInfo = modelInfo;
    useModelCapabiltyCache().addToCache(newModelName, modelInfo.capabilities);
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
            setModel(queriedModelList.value[focusedItemIndex.value].model);
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

const selectedModelInfo = computed(() => modelsList.value.find(model => model.model === config.selectedModel));

function setFocused(index: number) {
    focusedItemIndex.value = index;
}

const modelName = computed(() => {
    return selectedModelInfo.value?.name || config.selectedModel;
});
</script>

<template>
    <Dropdown :direction @opened="onToggled" ref="dropdownRef">
        <template #button>
            <span v-if="uiStore.isConnectedToOllama" class="flex flex-row gap-2 items-center">
                <ModelIcon :name="selectedModelInfo?.model || 'Unknown'" class="size-6" />
                {{ modelName }}
            </span>

            <p class="flex flex-row gap-2 items-center italic font-medium" v-else>
                <VscDebugDisconnect />
                Disconnected
            </p>
        </template>
        <template #menu>
            <div class="flex flex-row gap-2 items-center justify-center" role="listbox">
                <!-- Search bar -->
                <input ref="searchBarRef" v-model="searchQuery" @focus="searchFocused = true"
                    @blur="searchFocused = false" @keydown="searchKeyDown" type="search" placeholder="Search a model..."
                    class="border-2 border-primary focus:border-border w-full rounded-lg h-6 box-content p-3 outline-0"
                    :class="{ 'cursor-not-allowed': !uiStore.isConnectedToOllama }" aria-label="Search for a model..."
                    aria-controls="model-list" :disabled="!uiStore.isConnectedToOllama">
                <RouterLink to="/models"
                    class="h-6 p-3 box-content text-background !bg-primary hover:!bg-border cursor-pointer transition-colors duration-dynamic rounded-lg">
                    <TbListDetails />
                </RouterLink>
            </div>

            <ul role="list" class="max-h-80 overflow-y-auto *:not-last:mb-2">
                <li v-if="!uiStore.isConnectedToOllama" class="h-24 flex px-3 py-2 roundex-xl justify-center items-center font-bold gap-2">
                    <VscDebugDisconnect />
                    Not connected to Ollama.
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
                <ModelSelectItem v-else-if="queriedModelList.length > 0"
                    v-for="(model, index) in queriedModelList" :key="model.name" :model="model" :index="index"
                    :isCurrentModel="model.model === selectedModelInfo?.model" :selected="index === focusedItemIndex"
                    :queriedModelList="queriedModelList" @setModel="setModel" @mouseover="setFocused(index)"
                    ref="listItemsRef" />
            </ul>
        </template>
    </Dropdown>
</template>