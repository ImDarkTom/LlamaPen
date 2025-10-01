<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { BiCheck } from 'vue-icons-plus/bi';

const props = defineProps<{
    modelValue: string[];
    items: string[];
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

function handleClickOutside() {
    if (isMenuOpen.value) {
        toggleMenu();
    }
}

function handleSelectItem(item: string) {
    const newValue = [...props.modelValue];
    const index = newValue.indexOf(item);
    if (index === -1) {
        newValue.push(item);
    } else {
        newValue.splice(index, 1);
    }

    emit('update:modelValue', newValue);
}

function navigateItems(direction: 'up' | 'down') {
    const delta = direction === 'down' ? 1 : -1;
    activeIndex.value = (activeIndex.value + delta + props.items.length) % props.items.length;
    itemRefs.value[activeIndex.value].focus();
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
        handleSelectItem(props.items[activeIndex.value]);
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
    <div class="relative" v-click-outside="handleClickOutside">
        <button
            class="overflow-hidden text-ellipsis whitespace-nowrap"
            :class="buttonClass"
            tabindex="0"
            role="button"
            aria-haspopup="listbox"
            :aria-expanded="isMenuOpen"
            @click="toggleMenu"
            @keydown.enter.prevent="toggleMenu"
            @keydown.space.prevent="toggleMenu"
            @keydown="handleKeydown"
        >
            {{ modelValue.length > 0 ? modelValue.join(', ') : '(None)' }}
            <svg 
                :class="{ 'rotate-180': isMenuOpen }" 
                class="inline w-3 h-3 transition-transform"
                viewBox="0 0 12 12" 
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="2,4 6,8 10,4"/>
            </svg>
        </button>
        <div v-if="isMenuOpen" class="top-0 left-0">
            <ul
                role="listbox"
                class="absolute mt-1 z-10"
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
                    class="flex items-center"
                    :class="[itemClass, modelValue.includes(item) ? selectedItemClass : '']"
                    >
                    <BiCheck v-if="modelValue.includes(item)" class="mr-2" />
                    {{ item }}
                </li>
            </ul>
        </div>
    </div>
</template>