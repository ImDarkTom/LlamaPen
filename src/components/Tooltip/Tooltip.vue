<script setup lang="ts">
import { useFloatingMenu } from '@/composables/useFloatingMenu';
import { useConfigStore } from '@/stores/config';
import { onUnmounted, ref } from 'vue';

const props = withDefaults(defineProps<{
    text: string;
    disabled?: boolean;
    size? : 'small' | 'medium' | 'large';
}>(), {
    disabled: false,
    size: 'medium',
});

const config = useConfigStore();

const isVisible = ref<boolean>(false);
const timeoutDuration = config.ui.tooltip.waitTimeoutMs;
let timeoutId: null | NodeJS.Timeout = null;

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
                class="absolute z-[45]"
                :style="menuPosition">
                <div
                    class="bg-surface-light ring-border ring-1 max-w-prose w-max p-2 rounded-lg shadow-md"
                    :class="{ 'p-1.5!': size === 'small' }">
                    <span
                        data-testid="tooltip-text"
                        :class="{ 
                            'text-sm': size === 'small',
                            'text-md': size === 'medium',
                            'text-lg': size === 'large',
                        }">
                        {{ text }}
                    </span>
                </div>
            </div>
        </Teleport>
    </div>
</template>