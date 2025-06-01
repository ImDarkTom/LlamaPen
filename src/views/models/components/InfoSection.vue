<script setup lang="ts">
defineProps<{
    title: string;
    noBodyStyling?: boolean;
}>();
</script>

<template>
    <details class="w-full mb-6" open>
        <summary class="flex flex-row w-full cursor-pointer bg-primary-200 p-1 rounded-lg gap-2">
            <span class="text-3xl w-full select-none">{{ title }}</span>
        </summary>
        <slot v-if="noBodyStyling"></slot>
        <pre v-else class="prose prose-invert w-full min-w-full whitespace-pre-wrap break-all">
            <slot></slot>
        </pre>
    </details>
</template>