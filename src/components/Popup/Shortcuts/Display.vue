<script setup lang="ts">
defineProps<{
    label: string;
    hotkey: Hotkey;
}>();
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row w-full items-center justify-between text-sm">
            <span class="font-medium">{{ label }}</span>
            <UIKeyboardShortcutRenderer 
                class="text-sm! text-base-300!" 
                :hotkey />
        </div>
        <hr class="my-4 text-base-500">
    </div>
</template>