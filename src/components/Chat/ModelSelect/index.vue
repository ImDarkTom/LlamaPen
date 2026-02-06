<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue';
import { VscDebugDisconnect } from 'vue-icons-plus/vsc';
import logger from '@/lib/logger';
import { TbListDetails } from 'vue-icons-plus/tb';
import isOnMobile from '@/utils/core/isOnMobile';
import { BiExpand, BiFilterAlt, BiLoaderAlt, BiRefresh } from 'vue-icons-plus/bi';
import { storeToRefs } from 'pinia';
import { useModelSelect } from '@/stores/useModelSelect';
import { emitter } from '@/lib/mitt';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';
import useUIStore from '@/stores/uiStore';
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();

// State
const {
    isConnected,
    isLoading,
    rawModels,
    loadModels,
    refreshAndLoadModels,
    selectedModelInfo,
    allModelIds,
} = useProviderManager();

const {
    isMenuOpened: isOpened,
    searchQuery,
    queriedModelList,
    focusedItemIndex,
    filterMenuOpen,
    sortedItems
} = storeToRefs(useModelSelect());

const {
    setModel,
    resetState
} = useModelSelect();

const { renameModel } = useUIStore();

// Refs
const searchBarRef = ref<HTMLInputElement | null>(null);
const listItemsRef = ref<Array<ComponentPublicInstance<{ listItemRef: HTMLLIElement | null }>>>([]);

// Lifecycle hooks
onMounted(async () => {
    logger.info('Model Select Component', 'Selected model is', config.selectedModel);

    await loadModels(false);
    if (selectedModelInfo.value.exists) {
        setModel(
            selectedModelInfo.value.data.info, 
            true
        );
    } else {
        if (allModelIds.value.length > 0) {
            if (
                allModelIds.value[0] !== undefined &&
                rawModels.value[0] !== undefined
            ) {
                config.selectedModel = allModelIds.value[0];
                setModel(rawModels.value[0].info, true);
            }
        }
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyboardShortcuts);
});

// Functions
function handleKeyboardShortcuts(e: KeyboardEvent) {
    if (e.key === "M" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();

        isOpened.value = !isOpened.value;
        onToggled(isOpened.value);
    }
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
            const selectedItem = sortedItems.value[focusedItemIndex.value];
            
            if (selectedItem !== undefined) {
                setModel(selectedItem.info);
            }

            break;

        case "Escape":
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
                emitter.emit('modelSelectFocusFilter');
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

function setFocused(index: number) {
    focusedItemIndex.value = index;
}

function promptRenameModel(model: ModelInfo) {
    const displayName = model.displayName;
    
    let newName = prompt(`Enter a new name for '${displayName}' (app cosmetic only): '`, displayName);
    if (newName === '' || !newName) {
        newName = displayName;
    }

    renameModel(model.info.id, newName);
}


const modelName = computed(() => {
    if (!selectedModelInfo.value.exists) return "No model selected.";
    
    return selectedModelInfo.value.data.displayName;
});

const menuWidth = computed(() => config.ui.modelList.useGridView ? 'sm:w-xl': 'sm:w-96');
const useGridView = computed(() => config.ui.modelList.useGridView);
</script>

<template>
    <FloatingMenu v-model:is-opened="isOpened" @toggled="onToggled" preffered-position="top" :menu-width="menuWidth" >
        <template #button>
            <span v-if="isLoading" class="flex flex-row gap-2 items-center text-text-muted/75">
                <BiLoaderAlt class="animate-spin size-6 inline" />
                Loading models...
            </span>

            <span v-else-if="isConnected && selectedModelInfo.exists" class="flex flex-row gap-2 items-center">
                <IconModel :name="selectedModelInfo.data.info.id" class="size-6" />
                {{ modelName }}
            </span>

            <span v-else-if="isConnected">
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
                <div class="flex flex-row w-full rounded-lg overflow-hidden ring-[0.5px] ring-border focus-within:ring-highlight shadow-elevation-1 bg-surface-light">
                    <input 
                        class="w-full h-6 box-content p-3 outline-0"
                        :class="{ 'cursor-not-allowed': !isConnected }" 
                        ref="searchBarRef" 
                        type="search"
                        placeholder="Search a model..."
                        :disabled="!isConnected"
                        v-model="searchQuery" 
                        @keydown="searchKeyDown" 
                        aria-label="Search for a model..."
                        aria-controls="model-list" >
                    <button
                        @click="filterMenuOpen = !filterMenuOpen"
                        :class="{ 'bg-border-muted!': filterMenuOpen }"
                        class="p-3 hover:text-primary cursor-pointer transition-colors duration-dynamic">
                        <BiFilterAlt />
                    </button>
                </div>
                <RouterLink to="/models">
                    <div class="p-3 box-content text-background bg-primary hover:bg-highlight cursor-pointer transition-colors duration-dynamic rounded-lg">
                        <TbListDetails />
                    </div>
                </RouterLink>
                <button
                    @click="useGridView = !useGridView"
                    :class="{ 'bg-border!': useGridView }"
                    class="relative p-3 text-background bg-primary hover:bg-highlight cursor-pointer transition-colors duration-dynamic rounded-lg">
                    <BiExpand />
                </button>
            </div>

            <ChatModelSelectFilterMenu />

            <div 
                class="h-80 overflow-y-auto [scrollbar-width:thin]"
                :class="{ 'h-62!': filterMenuOpen }">
                <div v-if="isLoading" class="h-24 flex justify-center items-center">
                    <BiLoaderAlt class="animate-spin size-6" />
                </div>
                <div v-else-if="!isConnected" class="h-24 flex flex-col px-3 py-2 justify-center items-center font-bold gap-2">
                    <span>
                        <VscDebugDisconnect class="inline" />
                        Not connected to Ollama.
                    </span>
                    <ButtonPrimary
                        type="button"
                        color="primary"
                        text="Retry"
                        :icon="BiRefresh"
                        @click="refreshAndLoadModels "
                    />
                </div>
                <div v-else-if="queriedModelList.length === 0 && searchQuery !== ''"
                    class="flex w-full p-4 justify-center items-center">
                    No results.
                </div>
                <div v-else-if="queriedModelList.length === 0 && searchQuery === ''"
                    class="flex flex-col w-full p-4 justify-center items-center">
                    <span>No models found.</span>
                    <a href="https://ollama.com/search" target="_blank" class="text-secondary hover:underline">Search on Ollama</a>
                </div>
                <div v-else-if="sortedItems.length === 0" 
                    class="flex flex-col w-full p-4 justify-center items-center">
                    <span>No models matched filter.</span>
                </div>
                <template v-else-if="queriedModelList.filter((item) => !item.hidden).length > 0">
                    <component
                        :is="useGridView ? 'div' : 'ul'"
                        :class="useGridView
                            ? ' grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 m-2'
                            : '*:not-last:mb-1'"
                        :role="useGridView ? undefined : 'list'">
                        <ChatModelSelectItem 
                            v-for="(model, index) in sortedItems" 
                            :key="model.info.id" 
                            :layout="useGridView ? 'grid': 'row'"
                            :index
                            :model 
                            :isCurrentModel="model.info.id === selectedModelInfo.data?.info.id" 
                            :selected="index === focusedItemIndex"
                            :renameModel="() => promptRenameModel(model)"
                            @mouseover="setFocused(index)"
                            ref="listItemsRef" />
                    </component>
                </template>
                <li v-else class="flex flex-col w-full p-4 justify-center items-center">
                    <span>No unhidden models found. </span>
                </li>
            </div>
        </template>
    </FloatingMenu>
</template>