<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiCheck, BiChevronDown } from 'vue-icons-plus/bi';
import FloatingMenu from '../FloatingMenu/FloatingMenu.vue';

type ListItem = {
    value: string;
    label: string;
    icon?: IconType;
}

const props = defineProps<{
    modelValue: string[];
    items: ListItem[];
    buttonClass?: string;
    menuClass?: string;
    itemClass?: string;
    selectedItemClass?: string;
}>();

const isMenuOpen = ref(false);
const activeIndex = ref(0);
const hoveringOverIndex = ref(-1);
const itemRefs = ref<HTMLLIElement[]>([]);

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
}>();


function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
    if (isMenuOpen.value) {
        nextTick(() => {
            itemRefs.value[activeIndex.value]?.focus();
        });
    }
}

function handleSelectItem(item: ListItem) {
    const newValue = [...props.modelValue];
    const index = newValue.indexOf(item.value);
    if (index === -1) {
        newValue.push(item.value);
    } else {
        newValue.splice(index, 1);
    }

    emit('update:modelValue', newValue);
}

function navigateItems(direction: 'up' | 'down') {
    const delta = direction === 'down' ? 1 : -1;
    activeIndex.value = (activeIndex.value + delta + props.items.length) % props.items.length;

    const activeItem = itemRefs.value[activeIndex.value];
    activeItem?.focus();
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateItems('down');
    }
    if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateItems('up');
    }
}

function handleItemKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateItems('down');
    }
    if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateItems('up');
    }

    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const selectedItem = props.items[activeIndex.value];
        if (!selectedItem) return;

        handleSelectItem(selectedItem);
    }
    if (e.key === "Escape") {
        e.preventDefault();
        isMenuOpen.value = false;
    }
    if (e.key === "Tab") {
        isMenuOpen.value = false;
    }
}
</script>

<template>
    <FloatingMenu v-model:is-opened="isMenuOpen" :unstyled-button="true" :unstyled-menu="true">
        <template #button>
            <button
                class="overflow-hidden text-ellipsis whitespace-nowrap flex flex-row items-center"
                :class="buttonClass"
                tabindex="0"
                role="button"
                aria-haspopup="listbox"
                :aria-expanded="isMenuOpen"
                @keydown.enter.prevent="toggleMenu"
                @keydown.space.prevent="toggleMenu"
                @keydown="handleKeydown"
            >
                <template v-if="modelValue.length > 0">
                    <span v-for="item in items.filter(i => modelValue.includes(i.value))" :key="item.value" class="not-last:mr-1 inline-flex">
                        <component v-if="item.icon" :is="item.icon" class="mr-1 size-5" />
                        <span v-else>{{ item.label }}</span>
                    </span>
                </template>
                <template v-else>
                    (None)
                </template>
                <BiChevronDown class="size-4 ml-1 transition-transform inline" :class="{ 'rotate-180': isMenuOpen }" />
            </button>
        </template>
        <template #menu>
            <ul
                role="listbox"
                class="absolute z-10"
                :class="menuClass">
                <li 
                    tabindex="-1"
                    v-for="(item, index) in items"
                    :key="index"
                    role="option"
                    ref="itemRefs"
                    @click.prevent="handleSelectItem(item)"
                    @keydown="handleItemKeydown"
                    @mouseenter="hoveringOverIndex = index; activeIndex = index"
                    @mouseleave="hoveringOverIndex = -1"
                    class="flex items-center select-none"
                    :class="[itemClass, modelValue.includes(item.value) ? selectedItemClass : '']" >
                    <BiCheck v-if="modelValue.includes(item.value)" />
                    <component v-if="item.icon" :is="item.icon" class="mr-2" />
                    {{ item.label }}
                </li>
            </ul>
        </template>
    </FloatingMenu>
</template>