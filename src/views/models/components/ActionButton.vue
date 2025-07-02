<script setup lang="ts">
defineProps<{
    type: 'danger' | 'normal' | 'toggled';
}>();
</script>

<template>
    <div class="text-background-light p-4 min-w-max rounded-lg cursor-pointer select-none flex items-center justify-center flex-row gap-2"
        :class="{
            'bg-danger': type === 'danger',
            'bg-primary': type === 'normal',
            'bg-border-muted text-text-muted': type === 'toggled'
        }">
        <slot></slot>
    </div>
</template>