<script setup lang="ts">
defineProps<{
    type: 'danger' | 'normal';
}>();
</script>

<template>
    <div class="p-4 max-w-fit rounded-lg cursor-pointer select-none"
        :class="{ 'bg-red-500': type === 'danger', 'bg-primary-200': type === 'normal' }">
        <slot></slot>
    </div>
</template>