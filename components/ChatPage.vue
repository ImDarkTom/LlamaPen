<script setup lang="ts">
defineProps<{
    id: number | null;
}>();
</script>

<template>
    <span>chat page {{ id ?? 'none' }}</span>
</template>
