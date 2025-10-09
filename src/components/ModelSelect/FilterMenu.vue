<script setup lang="ts">
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import { useConfigStore } from '@/stores/config';
import { ref } from 'vue';
import { BiBrain, BiRefresh, BiShow, BiWrench } from 'vue-icons-plus/bi';
import MultiItemSelect from './MultiItemSelect.vue';

const config = useConfigStore();
const { getModelCapabilities } = useModelList();

defineProps<{
    filterMenuOpen: boolean;
}>();

const orderBy = ref<'default' | 'alphabetically' | 'size'>('default');
const filterCapabilities = ref<OllamaCapability[]>([]);
const direction = ref<'asc' | 'des'>('asc');

function userSort(items: ModelInfoListItem[]) {
    if (filterCapabilities.value.length > 0) {
        items = items.filter((item) => {
            const capabilities = getModelCapabilities(item);
            return filterCapabilities.value.every((cap) => capabilities.includes(cap));
        });
    }

    const favoriteModels = config.models.favoriteModels ?? [];
    const favorites: ModelInfoListItem[] = [];
    const nonFavorites: ModelInfoListItem[] = [];

    items.forEach(item => {
        if (favoriteModels.includes(item.modelData.model)) {
            favorites.push(item);
        } else {
            nonFavorites.push(item);
        }
    });

    switch (orderBy.value) {
        case 'default':
            break;
        case 'alphabetically':
            nonFavorites.sort((a, b) => {
                const item1 = a.modelData.model.split('/')[1] ?? a.modelData.model;
                const item2 = b.modelData.model.split('/')[1] ?? b.modelData.model;
                return item1.localeCompare(item2, undefined, { sensitivity: 'base' });
            });
            break;
        case 'size':
            nonFavorites.sort((a, b) => a.modelData.size - b.modelData.size);
            break;
    }

    if (direction.value === 'des') {
        nonFavorites.reverse();
        favorites.reverse();
    }

    return [...favorites, ...nonFavorites];
}

defineExpose({
    userSort,
});

</script>

<template>
    <div v-if="filterMenuOpen" class="max-h-16 relative flex flex-row gap-2 pb-2 overflow-x-auto">
        <div class="flex flex-col justify-end">
            <button 
                class="bg-surface-light p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0"
                @click="filterCapabilities = []; orderBy = 'default'; direction = 'asc'" >
                <BiRefresh class="size-5" />
            </button>
        </div>
        <label class="flex flex-col">
            <span class="text-sm">Filter</span>
            <MultiItemSelect v-model="filterCapabilities" :items="[
                {
                    label: 'Thinking',
                    value: 'thinking',
                    icon: BiBrain,
                },
                {
                    label: 'Vision',
                    value: 'vision',
                    icon: BiShow,
                },
                {
                    label: 'Tools',
                    value: 'tools',
                    icon: BiWrench,
                }
            ]"
                button-class="bg-surface-light w-full p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0 line-clamp-1 "
                menu-class="bg-surface w-full min-w-fit p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0 max-h-48 overflow-y-auto"
                item-class="p-1 rounded-md hover:bg-surface-light" selected-item-class="bg-primary! text-background" />
        </label>
        <label class="flex flex-col">
            <span class="text-sm">Order</span>
            <select v-model="orderBy" ref="orderBySelect"
                class="bg-surface-light p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0">
                <option value="default">Default ({{ config.cloud.enabled ? 'Creator Name' : 'Added date' }})</option>
                <option value="alphabetically">Alphabetically</option>
                <option value="size">Size</option>
            </select>
        </label>
        <label class="flex flex-col">
            <span class="text-sm">Direction</span>
            <select v-model="direction" ref="directionSelect"
                class="bg-surface-light p-2 rounded-md ring-inset ring-2 ring-border-muted focus:ring-border outline-0">
                <option value="des">Descending</option>
                <option value="asc">Ascending</option>
            </select>
        </label>
    </div>
</template>