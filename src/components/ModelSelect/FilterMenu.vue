<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { BiBrain, BiRefresh, BiShow, BiWrench } from 'vue-icons-plus/bi';
import MultiItemSelect from './MultiItemSelect.vue';
import { useModelSelect } from '@/stores/useModelSelect';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { emitter } from '@/lib/mitt';

const config = useConfigStore();

const { filterCapabilities, direction, orderBy, filterMenuOpen } = storeToRefs(useModelSelect());

const filterMenu = ref<HTMLElement | null>(null);

onMounted(() => {
    emitter.on('modelSelectFocusFilter', () => filterMenu.value?.focus());
});

onBeforeUnmount(() => {
    emitter.off('modelSelectFocusFilter', () => filterMenu.value?.focus());
})

</script>

<template>
    <div v-if="filterMenuOpen" class="max-h-16 relative flex flex-row gap-2 pb-2 overflow-x-auto" ref="filterMenu">
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