<script setup lang="ts">
defineProps<{
    label: string;
    shortcut: string;
}>();

const getTitleCase = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row w-full items-center justify-between text-sm">
            <span>{{ label }}</span>
            <div class="flex flex-row gap-2">
                <kbd 
                    v-for="key in shortcut.split(' ')"
                    class="bg-base-800 p-1 rounded-lg ring-1 ring-base-400 px-3 text-center">
                    {{ getTitleCase(key) }}
                </kbd>
            </div>
        </div>
        <hr class="my-4 text-base-500">
    </div>
</template>