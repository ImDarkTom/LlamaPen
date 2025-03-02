<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    text: string;
}>();

let visible = ref<boolean>(false);

function showTooltip() {
    visible.value = true;
}

function hideTooltip() {
    visible.value = false;
}
</script>

<template>
    <div class="relative inline-block" @mouseenter="showTooltip" @mouseleave="hideTooltip">
        <slot></slot>
        <div v-if="visible" class="bg-primary-100 absolute top-[110%] left-[50%] w-max -translate-x-[50%] p-2 rounded-lg shadow-sm shadow-black">
            <div class="absolute -top-[0.15ch] left-[50%] rotate-45 -translate-x-[50%] w-[1ch] h-[1ch] bg-primary-100"></div>
            <span class="tooltip-text">{{ text }}</span>
        </div>
    </div>
</template>