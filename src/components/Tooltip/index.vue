<script setup lang="ts">
import { useFloatingMenu } from '@/composables/useFloatingMenu';
import { useConfigStore } from '@/stores/config';
import { onUnmounted, ref } from 'vue';

const props = withDefaults(defineProps<{
    text: string;
    kbdShortcut?: Hotkey;
    disabled?: boolean;
    size? : 'tiny' | 'small' | 'medium' | 'large';
}>(), {
    disabled: false,
    size: 'medium',
});

const config = useConfigStore();

const isVisible = ref<boolean>(false);
const timeoutDuration = config.ui.tooltip.waitTimeoutMs;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const buttonRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

const { menuPosition } = useFloatingMenu({
    isOpened: isVisible,
    buttonRef,
    menuRef,
    anchored: 'center',
    paddingPx: 8,
    prefferedPosition: 'bottom'
});

function showTooltip() {
    if (props.disabled) return;

    timeoutId = setTimeout(() => {
        isVisible.value = true;
    }, timeoutDuration);
}

function hideTooltip() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    isVisible.value = false;
}

onUnmounted(() => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
});
</script>

<template>
    <div class="inline-block" @mouseenter="showTooltip" @mouseleave="hideTooltip">
        <div ref="buttonRef">
            <slot />
        </div>
        <Teleport to="body" v-if="isVisible">
            <div 
                ref="menuRef"
                class="absolute z-45"
                :style="menuPosition">
                <div
                    class="flex flex-col items-center bg-base-700 ring-base-600 ring-1 max-w-prose w-max p-2 rounded-lg shadow-md"
                    :class="{ 
                        'text-xs font-medium px-1.5! py-0.5!': size === 'tiny',
                        'text-sm font-medium p-1.5!': size === 'small',
                        'text-md': size === 'medium',
                        'text-lg': size === 'large',
                    }">
                    <span data-testid="tooltip-text">
                        {{ text }}
                    </span>
                    
                    <UIKeyboardShortcutRenderer 
                        v-if="kbdShortcut" 
                        :hotkey="kbdShortcut" />
                </div>
            </div>
        </Teleport>
    </div>
</template>