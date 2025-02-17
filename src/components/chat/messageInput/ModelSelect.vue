<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useConfigStore } from '../../../stores/config';
import { BsChevronDown } from 'vue-icons-plus/bs';

const config = useConfigStore();

const modelsList = ref<ModelList>([]);
const selectedModel = ref<string | null>(localStorage.getItem('selectedModel'));

onMounted(() => {
    fetch(config.apiUrl('/api/tags'))
        .then(response => response.json())
        .then(response => {
            modelsList.value = response.models;

            if (!selectedModel.value || !modelsList.value.map((item) => item.name).includes(selectedModel.value)) {
                selectedModel.value = response.models[0].model;
            }
        });
});

function setModel(newModelName: string) {
    selectedModel.value = newModelName;
    localStorage.setItem('selectedModel', newModelName);
    toggleShowSelect();
    searchQuery.value = "";
}

const showSelect = ref<boolean>(false);
const searchBarRef = ref<HTMLInputElement | null>(null);

async function toggleShowSelect() {
    showSelect.value = !showSelect.value;

    if (showSelect) {
        await nextTick();
        searchBarRef.value?.focus();
    }
}

function searchKeyUp(e: KeyboardEvent) {
    if (e.key === "Enter" && queriedModelList.value.length === 1) {
        setModel(queriedModelList.value[0].name);
        return;
    }

    if (e.key === "Escape") {
        toggleShowSelect();
    }
}

const searchQuery = defineModel<string>('');

const queriedModelList = computed<ModelList>(() => {
    return modelsList.value.filter((model) => model.name.toLowerCase().includes((searchQuery.value || "").toLowerCase()));
});

const searchFocused = ref<boolean>(false);
</script>

<template>
    <div class="relative">
        <div @click="toggleShowSelect"
            class="bg-primary-400 hover:bg-primary-500 cursor-pointer p-3 box-border rounded-xl flex flex-row gap-2 text-txt-2 hover:text-txt-1 transition-colors duration-150 select-none">
            {{ selectedModel }}
            <BsChevronDown class="w-4 h-full" />
        </div>
        <div v-if="showSelect" class="absolute left-0 bottom-full mb-2 bg-primary-300 p-1 rounded-xl">
            <input ref="searchBarRef" v-model="searchQuery" @focus="searchFocused = true" @blur="searchFocused = false" @keyup="searchKeyUp" type="search" placeholder="Search a model..." class="bg-primary-400 focus:bg-primary-500 w-full rounded-xl h-10 p-2 !mb-1 outline-0">
            <ul class="max-h-80 overflow-y-auto">
                <li @click="setModel(model.name)" v-for="model in queriedModelList" :key="model.name"
                    class="flex flex-col cursor-pointer px-3 py-2 hover:bg-primary-400 rounded-xl"
                    :class="{ 'first:bg-primary-500': searchFocused }"
                    >
                    <span class="min-w-max text-md font-semibold">{{ model.name }}</span>
                    <span class="text-sm text-txt-2">{{ model.details.parameter_size }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>