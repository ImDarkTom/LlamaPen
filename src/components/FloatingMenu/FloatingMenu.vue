<script setup lang="ts">
import { computed, ref } from 'vue';
import { BiChevronDown, BiChevronUp } from 'vue-icons-plus/bi';

const buttonRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

const props = withDefaults(defineProps<{
    isOpened?: boolean;
    unstyledMenu?: boolean;
    unstyledButton?: boolean;
}>(), {
    isOpened: false,
    unstyledMenu: false,
    unstyledButton: false,
});

const emit = defineEmits<{
    (e: 'update:isOpened', value: boolean): void
    (e: 'toggled', value: boolean): void;
}>();

const padding = 8; // px
const menuPosition = computed<{ top?: string, bottom?: string, left?: string }>(() => {
    if (
        !props.isOpened || 
        !buttonRef.value || 
        !menuRef.value
    ) return { top: '0px', left: '0px' };
    
    const buttonRect = buttonRef.value.getBoundingClientRect();
    const menuHeight = menuRef.value.offsetHeight;
    const menuWidth = menuRef.value.offsetWidth;

    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    const shouldShowAbove = menuHeight > spaceBelow && spaceAbove >= menuHeight;
    const vertical  = shouldShowAbove
        ? { bottom: `${window.innerHeight - buttonRect.top - window.scrollY + padding}px` }
        : { top: `${buttonRect.bottom + window.scrollY - padding}px` };

    const buttonCenter = buttonRect.left + buttonRect.width / 2 + window.scrollX;
    const left = `${buttonCenter - (menuWidth / 2)}px`;

    return { ...vertical, left };
});

function toggleMenu() {
    emit('toggled', !props.isOpened);
    emit('update:isOpened', !props.isOpened);
}

function handleClickOutside(e: Event) {
    const target = e.target as HTMLElement;
    if (
        buttonRef.value?.contains(target) ||
        menuRef.value?.contains(target) || 
        target.classList.contains('dropdown-id') ||
        target.closest('.dropdown-id')
    ) return;

    if (props.isOpened) {
        toggleMenu();
    }
}
</script>

<template>
    <div v-click-outside="handleClickOutside">
        <div
            :class="{
                'flex flex-row items-center gap-1 w-max select-none cursor-pointer rounded-lg transition-all duration-dynamic text-text-muted hover:text-text ring-1 ring-text-muted hover:ring-text h-10 p-2 pointer-coarse:p-3 box-border': !unstyledButton
            }"
            :aria-expanded="isOpened"
            @click.stop="toggleMenu" 
            ref="buttonRef">
            <slot name="button" />
            <template v-if="!unstyledButton">
                <template v-if="true ">
                    <BiChevronUp v-if="isOpened"  />
                    <BiChevronDown v-else  />
                </template>
                <template v-else>
                    <BiChevronDown v-if="isOpened" />
                    <BiChevronUp v-else />
                </template>
            </template>
        </div>
        <Teleport to="body">
            <Transition 
                :enter-active-class="[
                    'motion-scale-in-[0.5]',
                    menuPosition.top ? 'motion-translate-y-in-[25%]' : 'motion-translate-y-in-[-25%]',
                    'motion-opacity-in-[0%]',
                    'motion-duration-[var(--transition-duration)]'
                ].join(' ')" 
                :leave-active-class="[
                    'motion-scale-out-[0.5]',
                    menuPosition.bottom ? 'motion-translate-y-out-[-25%]' : 'motion-translate-y-out-[25%]',
                    'motion-opacity-out-[0%]',
                    'motion-duration-[var(--transition-duration)]',
                ].join(' ')" >
                <div
                    v-if="isOpened"
                    ref="menuRef"
                    class="absolute z-[999] dropdown-id"
                    :class="{
                        'bg-surface p-1.5 flex flex-col gap-2 rounded-lg max-w-[100dvw-3rem] w-full sm:w-96 shadow-md shadow-background': !unstyledMenu,
                    }"
                    :style="menuPosition">
                    <slot name="menu" />
                </div>
            </Transition>
        </Teleport>
    </div>
</template>