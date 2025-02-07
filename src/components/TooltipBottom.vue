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
    <div class="tooltip-container" @mouseenter="showTooltip" @mouseleave="hideTooltip">
        <slot></slot>
        <div v-if="visible" class="tooltip">
            <div class="diamond"></div>
            <span class="tooltip-text">{{ text }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tooltip-container {
    position: relative;
    display: inline-block;
}

.tooltip {
    @include mixin.shadow-low;

    position: absolute;
    top: 110%;
    left: 50%;
    width: max-content;
    transform: translateX(-50%);
    background-color: var(--bg-4);
    padding: 0.5rem;
    border-radius: 0.5rem;

    .diamond {
        position: absolute;
        top: -0.15ch;
        left: 50%;
        transform: rotate(45deg) translateX(-50%);
        background-color: var(--bg-4);
        width: 1ch;
        height: 1ch;
    }
}
</style>