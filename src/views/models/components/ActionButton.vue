<script setup lang="ts">
defineProps<{
    type: 'danger' | 'normal' | 'toggled';
}>();
</script>

<template>
    <div class="p-4 min-w-max rounded-lg cursor-pointer select-none flex items-center justify-center flex-row gap-2"
        :class="{
            'bg-red-500': type === 'danger',
            'bg-primary-200': type === 'normal',
            'bg-primary-400': type === 'toggled'
        }">
        <slot></slot>
    </div>
</template>