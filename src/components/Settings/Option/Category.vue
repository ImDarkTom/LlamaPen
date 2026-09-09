<script setup lang="ts">
defineProps<{
    label: string;
    id: string;
}>();
</script>

<template>
    <section
        class="w-full"
        :id="id">
        <h2 class="text-2xl font-bold text-base-100 mb-1">{{ label }}</h2>
        <div class="flex flex-col gap-2 bg-base-800 p-3 rounded-xl">
            <slot></slot>
        </div>
    </section>
</template>
