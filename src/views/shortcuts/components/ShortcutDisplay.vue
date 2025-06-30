<script setup lang="ts">

defineProps<{
    label: string;
    shortcut: string;
}>();

const getTitleCase = (text: string) => {
    return text[0].toUpperCase() + text.slice(1);
};
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row w-full items-center justify-between">
            <span>{{ label }}</span>
            <div class="flex flex-row gap-2">
                <kbd v-for="key in shortcut.split(' ')"
                    class="bg-background-light p-1 rounded-lg ring-1 ring-border px-3 text-center">{{
                        getTitleCase(key) }}</kbd>
            </div>
        </div>
        <hr class="my-4">
    </div>
</template>