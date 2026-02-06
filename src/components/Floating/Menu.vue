<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, provide, ref, toRef, watch } from 'vue';
import { BiChevronUp } from 'vue-icons-plus/bi';
import { nanoid } from 'nanoid';
import { useFloatingMenu } from '@/composables/useFloatingMenu';

const props = withDefaults(defineProps<{
    isOpened?: boolean;
    anchored?: 'left' | 'center' | 'right';
    prefferedPosition?: 'top' | 'bottom';
    menuWidth?: string;
    disabled?: boolean;
    unstyledMenu?: boolean;
    unstyledButton?: boolean;
}>(), {
    isOpened: false,
    anchored: 'center',
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

const { menuPosition, recomputePosition } = useFloatingMenu({
    isOpened: toRef(props, 'isOpened'),
    buttonRef,
    menuRef,
    anchored: props.anchored,
    prefferedPosition: props.prefferedPosition,
    paddingPx: 8
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

watch(
    () => props.menuWidth,
    async () => {
        await recomputePosition();
    }
);
</script>

<template>
    <div v-click-outside="handleClickOutside">
        <div
            :class="{
                'flex flex-row items-center gap-1 w-max select-none cursor-pointer rounded-lg transition-all duration-dynamic text-text-muted hover:text-text ring-1 ring-highlight hover:ring-text-muted h-10 p-2 pointer-coarse:p-3 box-border': !unstyledButton,
                'group active': isOpened,
                'ring-text-muted': isOpened && !unstyledButton
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
                    (anchored !== 'center') ? (anchored === 'left' ? 'motion-translate-x-in-[-25%]' : 'motion-translate-x-in-[25%]')  : '',
                    'motion-opacity-in-[0%]',
                    'motion-duration-[var(--transition-duration)]'
                ].join(' ')" 
                :leave-active-class="[
                    'motion-scale-out-[0.5]',
                    prefferedPosition === 'bottom' ? 'motion-translate-y-out-[-25%]' : 'motion-translate-y-out-[25%]',
                    (anchored !== 'center') ? (anchored === 'left' ? 'motion-translate-x-out-[-25%]' : 'motion-translate-x-out-[25%]')  : '',
                    'motion-opacity-out-[0%]',
                    'motion-duration-[var(--transition-duration)]',
                ].join(' ')" >
                <div
                    v-if="isOpened"
                    ref="menuRef"
                    class="absolute z-45"
                    :data-dropdown-id="myDropdownId"
                    :class="[
                        {
                            'bg-surface p-1.5 flex flex-col gap-2 rounded-lg max-w-[100dvw-3rem] w-full shadow-elevation-4': !unstyledMenu,
                        },
                        menuWidth ? menuWidth : unstyledMenu ? '' : 'sm:w-96'
                    ]"
                    :style="menuPosition">
                    <slot name="menu" />
                </div>
            </Transition>
        </Teleport>
    </div>
</template>