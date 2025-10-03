<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiCheck } from 'vue-icons-plus/bi';
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

function handleClickOutside() {
    if (isMenuOpen.value) {
        toggleMenu();
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
        <FloatingMenu v-model:is-opened="isMenuOpen">
            <template #button>
                <button
                    class="overflow-hidden text-ellipsis whitespace-nowrap flex flex-row items-center"
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
                    <template v-if="modelValue.length > 0">
                        <span v-for="item in items.filter(i => modelValue.includes(i.value))" :key="item.value" class="not-last:mr-1 inline-flex">
                            <component v-if="item.icon" :is="item.icon" class="mr-1 size-5" />
                            <span v-else>{{ item.label }}</span>
                        </span>
                    </template>
                    <template v-else>
                        (None)
                    </template>
                    <svg 
                        :class="{ 'rotate-180': isMenuOpen }" 
                        class="inline w-3 h-3 ml-1 transition-transform"
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
            </template>
            <template #menu>
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
                            class="flex items-center select-none"
                            :class="[itemClass, modelValue.includes(item.value) ? selectedItemClass : '']"
                            >
                            <BiCheck v-if="modelValue.includes(item.value)" />
                            <component v-if="item.icon" :is="item.icon" class="mr-2" />
                            {{ item.label }}
                        </li>
                    </ul>
                </div>
            </template>
        </FloatingMenu>
    </div>
</template>