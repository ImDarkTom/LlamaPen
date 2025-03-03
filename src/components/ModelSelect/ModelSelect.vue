<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useConfigStore } from '../../stores/config';
import { BsChevronDown, BsChevronUp } from 'vue-icons-plus/bs';
import { useUiStore } from '../../stores/uiStore';
import { VscDebugDisconnect } from 'vue-icons-plus/vsc';
import ModelSelectItem from './ModelSelectItem.vue';

const config = useConfigStore();
const uiStore = useUiStore();

// State
const modelsList = ref<ModelList>([]);
const selectedModel = ref<string | null>(localStorage.getItem('selectedModel'));

// UI State
const showSelect = ref<boolean>(false);
const searchQuery = ref<string>('');
const searchFocused = ref<boolean>(false);
const focusedItemIndex = ref<number>(0);

// Refs
const searchBarRef = ref<HTMLInputElement | null>(null);
const listItemsRef = ref<Array<HTMLElement | null>>([]);

// Lifecycle hooks
onMounted(() => {
    fetch(config.apiUrl('/api/tags'))
        .then(response => response.json())
        .then(response => {
            modelsList.value = response.models;

            if (!selectedModel.value || !modelsList.value.map((item) => item.name).includes(selectedModel.value)) {
                selectedModel.value = response.models[0].model;
            }
        })
        .catch((error) => {
            console.log(error);
        });

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

function setModel(newModelName: string) {
    selectedModel.value = newModelName;
    localStorage.setItem('selectedModel', newModelName);
    toggleShowSelect();
    searchQuery.value = "";
}

function resetState() {
    searchQuery.value = "";
    focusedItemIndex.value = 0;
}

function toggleShowSelect() {
    showSelect.value = !showSelect.value;

    if (showSelect) {
        nextTick(() => {
            searchBarRef.value?.focus();
            listItemsRef.value[focusedItemIndex.value]?.scrollIntoView({ block: 'center' });
        });
    }
}

function searchKeyDown(e: KeyboardEvent) {
    let scrollDown = false;
    switch (e.key) {
        case "Enter":
            setModel(queriedModelList.value[focusedItemIndex.value].name);
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
    }

    if (scrollDown) {
        nextTick(() => {
            listItemsRef.value[focusedItemIndex.value]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
    }
}

const props = defineProps<{
    direction?: 'up' | 'down'
}>();
</script>

<template>
    <div v-mousedown-outside="handleClickOutside">
        <div class="relative" id="modelselect">
            <div @click="toggleShowSelect"
                class="bg-primary-400 hover:bg-primary-500 cursor-pointer p-3 box-border rounded-lg flex flex-row items-center gap-2 text-txt-2 hover:text-txt-1 transition-colors duration-150 select-none"
                aria-haspopup="listbox" :aria-expanded="showSelect">
                <template v-if="uiStore.connectedToOllama">
                    {{ selectedModel }}
                </template>
                <p class="flex flex-row gap-2 items-center italic" v-else>
                    <VscDebugDisconnect />
                    Disconnected
                </p>

                <template v-if="props.direction === 'up'">
                    <BsChevronUp v-if="showSelect" class="w-4 h-full" />
                    <BsChevronDown v-else class="w-4 h-full" />
                </template>
                <template v-else>
                    <BsChevronDown v-if="showSelect" class="w-4 h-full" />
                    <BsChevronUp v-else class="w-4 h-full" />
                </template>
            </div>

            <div v-if="showSelect" class="absolute left-0 bg-primary-300 p-1.5 rounded-lg w-[90dvw] sm:w-[90dvw] lg:w-[25rem] box-border z-10 shadow-md shadow-black/50 transition-shadow duration-100 
                motion-scale-in-[0.5] motion-translate-x-in-[-10%] motion-opacity-in-[0%] motion-duration-[0.10s]"
                :class="{
                    'bottom-full mb-2 motion-translate-y-in-[25%]': props.direction === 'up',
                    'top-full mt-2 motion-translate-y-in-[-25%]': props.direction === 'down'
                }" role="listbox">
                <input ref="searchBarRef" v-model="searchQuery" @focus="searchFocused = true"
                    @blur="searchFocused = false" @keydown="searchKeyDown" type="search" placeholder="Search a model..."
                    class="bg-primary-400 focus:bg-primary-500 w-full rounded-lg p-3 !mb-2 outline-0"
                    :class="{ 'cursor-not-allowed': !uiStore.connectedToOllama }" aria-label="Search for a model..."
                    aria-controls="model-list" :disabled="!uiStore.connectedToOllama">

                <ul role="list" class="max-h-80 overflow-y-auto">
                    <ModelSelectItem v-if="uiStore.connectedToOllama && queriedModelList.length > 0"
                        v-for="(model, index) in queriedModelList" 
                        :key="model.name" 
                        :model="model"
                        :index="index"
                        :focusedItemIndex="focusedItemIndex"
                        :queriedModelList="queriedModelList"
                        @setModel="setModel"
                         />
                    <li v-else-if="uiStore.connectedToOllama && queriedModelList.length === 0"
                        class="flex w-full p-4 justify-center items-center">
                        No results.
                    </li>
                    <li v-else class="h-24 flex px-3 py-2 roundex-xl justify-center items-center font-bold gap-2">
                        <VscDebugDisconnect />
                        Not connected to Ollama.
                    </li>
                </ul>

            </div>
        </div>
    </div>
</template>