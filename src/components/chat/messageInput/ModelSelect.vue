<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useConfigStore } from '../../../stores/config';
import { BsChevronDown, BsChevronUp } from 'vue-icons-plus/bs';
import errorHandler from '../../../utils/errorHandler';
import { useUiStore } from '../../../stores/uiStore';
import { VscDebugDisconnect } from 'vue-icons-plus/vsc';

const config = useConfigStore();
const uiStore = useUiStore();

// State
const modelsList = ref<ModelList>([]);
const selectedModel = ref<string | null>(localStorage.getItem('selectedModel'));

// UI State
const showSelect = ref<boolean>(false);
const searchQuery = defineModel<string>('');
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
            errorHandler.handleError(error, `Unable to connect to Ollama at '${config.ollamaUrl}'. Ensure Ollama is setup and running. For a guide on how to configure Ollama to work with this app press the '?' icon on the bottom left of the sidebar.'`, true);
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
</script>

<template>
    <div v-mousedown-outside="handleClickOutside">
        <div class="relative" id="modelselect">
            <div @click="toggleShowSelect"
                class="bg-primary-400 hover:bg-primary-500 cursor-pointer p-3 box-border rounded-xl flex flex-row items-center gap-2 text-txt-2 hover:text-txt-1 transition-colors duration-150 select-none"
                aria-haspopup="listbox" :aria-expanded="showSelect">
                <template v-if="uiStore.connectedToOllama">
                    {{ selectedModel }}
                </template>
                <p class="flex flex-row gap-2 items-center italic" v-else>
                    <VscDebugDisconnect />
                    Disconnected
                </p>
                <BsChevronUp v-if="showSelect" class="w-4 h-full" />
                <BsChevronDown v-else class="w-4 h-full" />
            </div>

            <div v-if="showSelect"
                class="absolute left-0 bottom-full mb-2 bg-primary-300 p-1 rounded-xl w-[90dvw] sm:w-[90dvw] lg:w-[25rem] box-border"
                role="listbox">
                <input ref="searchBarRef" v-model="searchQuery" @focus="searchFocused = true"
                    @blur="searchFocused = false" @keydown="searchKeyDown" type="search" placeholder="Search a model..."
                    class="bg-primary-400 focus:bg-primary-500 w-full rounded-xl h-10 p-2 !mb-1 outline-0"
                    :class="{ 'cursor-not-allowed': !uiStore.connectedToOllama }" aria-label="Search for a model..."
                    aria-controls="model-list" :disabled="!uiStore.connectedToOllama">

                <ul role="list" class="max-h-80 overflow-y-auto">
                    <li v-if="uiStore.connectedToOllama" role="listitem" v-for="(model, index) in queriedModelList"
                        :key="model.name"
                        class="flex flex-col cursor-pointer px-3 py-2 hover:bg-primary-400 rounded-xl overflow-x-hidden"
                        :class="{ 'bg-primary-500': index === focusedItemIndex }" @click="setModel(model.name)"
                        ref="listItemsRef" :aria-selected="index === focusedItemIndex">
                        <span class="w-full text-md font-semibold text-ellipsis whitespace-nowrap overflow-hidden"
                            :title="model.name">{{ model.name }}</span>
                        <span class="text-sm text-txt-2">{{ model.details.parameter_size }}</span>
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