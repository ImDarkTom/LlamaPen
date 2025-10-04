<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { BiChevronUp } from 'vue-icons-plus/bi';
import { nanoid } from 'nanoid';

const props = withDefaults(defineProps<{
    isOpened?: boolean;
    prefferedPosition?: 'top' | 'bottom';
    disabled?: boolean;
    unstyledMenu?: boolean;
    unstyledButton?: boolean;
}>(), {
    isOpened: false,
    prefferedPosition: 'bottom',
    disabled: false,
    unstyledMenu: false,
    unstyledButton: false,
});

const emit = defineEmits<{
    (e: 'update:isOpened', value: boolean): void
    (e: 'toggled', value: boolean): void;
}>();

// Provide/inject to manage nested dropdowns
const myDropdownId = nanoid();
const registerToParent = inject<((childId: string) => void) | undefined>('registerChild', undefined);
const unregisterToParent = inject<((childId: string) => void) | undefined>('unregisterChild', undefined);

const buttonRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const childDropdowns = ref<string[]>([]);

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

    const shouldShowAbove = 
        (menuHeight > spaceBelow && spaceAbove >= menuHeight) ||
        (props.prefferedPosition === 'top' && spaceAbove >= menuHeight);
    const vertical  = shouldShowAbove
        ? { bottom: `${window.innerHeight - buttonRect.top - window.scrollY + padding}px` }
        : { top: `${buttonRect.bottom + window.scrollY - padding}px` };

    const buttonCenter = buttonRect.left + buttonRect.width / 2 + window.scrollX;

    let left = buttonCenter - (menuWidth / 2);
    left = Math.max(0, Math.min(left, window.innerWidth - menuWidth));

    return { ...vertical, left: `${left}px` };
});

function toggleMenu() {
    if (props.isOpened) {
        emit('update:isOpened', false);
        emit('toggled', false);
    } else {
        if (props.disabled) return;
        emit('update:isOpened', true);
        emit('toggled', true);
    }
}

function handleClickOutside(e: Event) {
    const target = e.target as HTMLElement;
    if (
        buttonRef.value?.contains(target) ||
        menuRef.value?.contains(target) || 
        childDropdowns.value.some(childId => {
            const childMenu = document.querySelector(`[data-dropdown-id="${childId}"]`);
            return childMenu?.contains(target);
        })
    ) return;
    
    if (props.isOpened) {
        toggleMenu();
    }
}

const registerChild = (childId: string) => {
    childDropdowns.value.push(childId);
};

const unregisterChild = (childId: string) => {
    childDropdowns.value = childDropdowns.value.filter(id => id !== childId);
};

provide('registerChild', registerChild);
provide('unregisterChild', unregisterChild);

onMounted(() => {
    if (registerToParent) {
        registerToParent(myDropdownId);
    }
});

onBeforeUnmount(() => {
    if (unregisterToParent) {
        unregisterToParent(myDropdownId);
    }
});
</script>

<template>
    <div v-click-outside="handleClickOutside">
        <div
            :class="{
                'flex flex-row items-center gap-1 w-max select-none cursor-pointer rounded-lg transition-all duration-dynamic text-text-muted hover:text-text ring-1 ring-text-muted hover:ring-text h-10 p-2 pointer-coarse:p-3 box-border': !unstyledButton
            }"
            :aria-expanded="isOpened"
            @click="toggleMenu" 
            ref="buttonRef">
            <slot name="button" />
            <BiChevronUp
                v-if="!unstyledButton"
                class="transition-transform" 
                :class="{ 'rotate-180': isOpened  }" />
        </div>
        <Teleport to="body">
            <Transition 
                :enter-active-class="[
                    'motion-scale-in-[0.5]',
                    prefferedPosition === 'top' ? 'motion-translate-y-in-[25%]' : 'motion-translate-y-in-[-25%]',
                    'motion-opacity-in-[0%]',
                    'motion-duration-[var(--transition-duration)]'
                ].join(' ')" 
                :leave-active-class="[
                    'motion-scale-out-[0.5]',
                    prefferedPosition === 'bottom' ? 'motion-translate-y-out-[-25%]' : 'motion-translate-y-out-[25%]',
                    'motion-opacity-out-[0%]',
                    'motion-duration-[var(--transition-duration)]',
                ].join(' ')" >
                <div
                    v-if="isOpened"
                    ref="menuRef"
                    class="absolute z-[25]"
                    :data-dropdown-id="myDropdownId"
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