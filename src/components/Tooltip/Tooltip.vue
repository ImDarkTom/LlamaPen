<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { onUnmounted, ref } from 'vue';

const config = useConfigStore();

const props = withDefaults(defineProps<{
    text: string;
    disabled?: boolean;
    size? : 'small' | 'medium' | 'large';
}>(), {
    disabled: false,
    size: 'medium',
});

let visible = ref<boolean>(false);
let timeoutId: null | NodeJS.Timeout = null;
let timeoutDuration = config.ui.tooltip.waitTimeoutMs;

function showTooltip() {
    if (props.disabled) return;

    timeoutId = setTimeout(() => {
        visible.value = true;
    }, timeoutDuration);
}

function hideTooltip() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    visible.value = false;
}

onUnmounted(() => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
});
</script>

<template>
    <div class="relative inline-block" @mouseenter="showTooltip" @mouseleave="hideTooltip">
        <slot></slot>
        <div v-if="visible"
            class="bg-surface-light max-w-prose absolute top-[110%] left-[50%] w-max -translate-x-[50%] p-2 rounded-lg shadow-md shadow-background-dark z-40">
            <div class="absolute -top-[0.15ch] left-[50%] rotate-45 -translate-x-[50%] w-[1ch] h-[1ch] bg-surface-light">
            </div>
            <span
                :class="{ 
                    'text-sm': size === 'small',
                    'text-md': size === 'medium',
                    'text-lg': size === 'large',
                }">{{ text }}</span>
        </div>
    </div>
</template>