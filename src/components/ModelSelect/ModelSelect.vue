<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue';
import { useConfigStore } from '../../stores/config';
import { useUiStore } from '../../stores/uiStore';
import { VscDebugDisconnect } from 'vue-icons-plus/vsc';
import ModelSelectItem from './ModelSelectItem.vue';
import DropdownButton from '../Dropdown/DropdownButton.vue';
import logger from '@/lib/logger';
import ollamaApi from '@/utils/ollama';
import ModelIcon from '../Icon/ModelIcon.vue';
import { TbListDetails } from 'vue-icons-plus/tb';
import isOnMobile from '@/utils/core/isOnMobile';
import ollamaRequest from '@/utils/ollamaRequest';
import { useModelCapabiltyCache } from '@/composables/modelCapabilities';

const config = useConfigStore();
const uiStore = useUiStore();

// State
const modelsList = ref<ModelList>([]);

// UI State
const showSelect = ref<boolean>(false);
const searchQuery = ref<string>('');
const searchFocused = ref<boolean>(false);
const focusedItemIndex = ref<number>(0);

// Refs
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
        toggleShowSelect();
    }
}

function handleClickOutside() {
    if (showSelect.value) {
        toggleShowSelect();
    }
}

async function setModel(newModelName: string) {
    config.selectedModel = newModelName;

    toggleShowSelect();
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

function toggleShowSelect() {
    showSelect.value = !showSelect.value;

    if (showSelect) {
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
            toggleShowSelect();
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
    buttonClasses?: string
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
    <div v-mousedown-outside="handleClickOutside">
        <div id="modelselect">
            <DropdownButton :direction="direction" :opened="showSelect" :additional-classes="buttonClasses"
                @update:opened="toggleShowSelect">

                <span v-if="uiStore.isConnectedToOllama" class="flex flex-row gap-2 items-center">
                    <ModelIcon :name="selectedModelInfo?.model || 'Unknown'" class="size-6" />
                    {{ modelName }}
                </span>

                <p class="flex flex-row gap-2 items-center italic" v-else>
                    <VscDebugDisconnect />
                    Disconnected
                </p>
            </DropdownButton>

            <Transition
                :enter-active-class="[
                    'motion-scale-in-[0.5]',
                    direction === 'up' ? 'motion-translate-y-in-[25%]' : 'motion-translate-y-in-[-25%]',
                    'motion-translate-x-in-[-10%]',
                    'motion-opacity-in-[0%]',
                    'motion-duration-[var(--transition-duration)]'
                ].join(' ')"
                :leave-active-class="[
                    'motion-scale-out-[0.5]',
                    direction === 'up' ? 'motion-translate-y-out-[25%]' : 'motion-translate-y-out-[-25%]',
                    'motion-translate-x-out-[-10%]',
                    'motion-opacity-out-[0%]',
                    'motion-duration-[var(--transition-duration)]'
                ].join(' ')"
            >

                <div v-if="showSelect" class="absolute flex flex-col gap-2 left-0 bg-surface p-1.5 rounded-lg max-w-[100dvw-3rem] w-full sm:w-96 box-border z-20 shadow-md shadow-background"
                    :class="{
                        'bottom-full mb-2': direction === 'up',
                        'top-full mt-2': direction === 'down'
                    }" role="listbox">
                    <div class="flex flex-row gap-2 items-center justify-center">
                        <!-- Search bar -->
                        <input ref="searchBarRef" v-model="searchQuery" @focus="searchFocused = true"
                            @blur="searchFocused = false" @keydown="searchKeyDown" type="search"
                            placeholder="Search a model..."
                            class="border-2 border-primary focus:border-border w-full rounded-lg h-6 box-content p-3 outline-0"
                            :class="{ 'cursor-not-allowed': !uiStore.isConnectedToOllama }"
                            aria-label="Search for a model..." aria-controls="model-list"
                            :disabled="!uiStore.isConnectedToOllama">
                        <RouterLink to="/models"
                            class="h-6 p-3 box-content text-background !bg-primary hover:!bg-border cursor-pointer transition-colors duration-dynamic rounded-lg">
                            <TbListDetails />
                        </RouterLink>
                    </div>

                    <ul role="list" class="max-h-80 overflow-y-auto *:not-last:mb-2">
                        <ModelSelectItem 
                            v-if="uiStore.isConnectedToOllama && queriedModelList.length > 0"
                            v-for="(model, index) in queriedModelList" :key="model.name" 
                            :model="model" 
                            :index="index"
                            :isCurrentModel="model.model === selectedModelInfo?.model"
                            :selected="index === focusedItemIndex" 
                            :queriedModelList="queriedModelList"
                            @setModel="setModel" 
                            @mouseover="setFocused(index)" 
                            ref="listItemsRef" 
                        />
                        <li v-else-if="uiStore.isConnectedToOllama && queriedModelList.length === 0"
                            class="flex w-full p-4 justify-center items-center">
                            No results.
                        </li>
                        <li v-else class="h-24 flex px-3 py-2 roundex-xl justify-center items-center font-bold gap-2">
                            <VscDebugDisconnect />
                            Not connected to Ollama.
                        </li>
                    </ul>
                </div>
            </Transition>
        </div>
    </div>
</template>