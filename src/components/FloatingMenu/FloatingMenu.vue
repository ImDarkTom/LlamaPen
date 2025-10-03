<script setup lang="ts">
import { computed, ref } from 'vue';

const buttonRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpened = ref(false);

const emit = defineEmits<{
    (e: 'update:isOpened', value: boolean): void
    (e: 'toggled', value: boolean): void;
}>();

const menuTop = computed(() => {
    if (!isOpened.value || !buttonRef.value) return 0;

    const buttonRect = buttonRef.value.getBoundingClientRect();
    const menuHeight = menuRef.value?.offsetHeight ?? 0;
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // If not enough space below, show above
    if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
        return buttonRect.top + window.scrollY - menuHeight;
    }
    // Otherwise, show below
    return buttonRect.bottom + window.scrollY;
});

const menuLeft = computed(() => {
    if (!isOpened.value || !buttonRef.value) return 0;

    const buttonRect = buttonRef.value.getBoundingClientRect();
    return buttonRect.left + window.scrollX;
});

function toggleMenu() {
    isOpened.value = !isOpened.value;
    emit('toggled', isOpened.value);
    emit('update:isOpened', isOpened.value);
}

function handleClickOutside(e: Event) {
    const target = e.target as HTMLElement;
    if (
        buttonRef.value?.contains(target) ||
        menuRef.value?.contains(target)
    ) return;

    if (isOpened.value) {
        toggleMenu();
    }
}
</script>

<template>
    <div v-click-outside="handleClickOutside" @click.stop>
        <div @click.prevent="toggleMenu" ref="buttonRef">
            <slot name="button" />
        </div>
        <Teleport to="body">
            <div
                v-if="isOpened" 
                ref="menuRef" 
                class="absolute z-[999]"
                :style="[ { top: `${menuTop}px`, left: `${menuLeft}px` } ]">
                <slot name="menu" />
            </div>
        </Teleport>
    </div>
</template>