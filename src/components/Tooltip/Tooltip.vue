<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

defineProps<{
    text: string;
}>();

let visible = ref<boolean>(false);
let timeoutId: null | NodeJS.Timeout = null;
let timeoutDuration = 500; // todo: make configurable

function showTooltip() {
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
        <div v-if="visible" class="opacity-90 bg-primary-100 absolute top-[110%] left-[50%] w-max -translate-x-[50%] p-2 rounded-lg shadow-sm shadow-black z-40">
            <div class="absolute -top-[0.15ch] left-[50%] rotate-45 -translate-x-[50%] w-[1ch] h-[1ch] bg-primary-100"></div>
            <span class="tooltip-text">{{ text }}</span>
        </div>
    </div>
</template>