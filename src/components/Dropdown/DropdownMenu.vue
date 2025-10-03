<script setup lang="ts">
defineProps<{
    opened: boolean,
    includeNotch?: boolean;
}>();
</script>

<template>
    <div v-if="includeNotch" class="absolute -top-[0.25rem] left-[50%] rotate-45 -translate-x-[50%] w-[1ch] h-[1ch] bg-surface z-[19]"></div>
    <slot />
</template>