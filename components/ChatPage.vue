<script setup lang="ts">
defineProps<{
    id: number | null;
}>();
</script>

<template>
    <div class="flex flex-col h-full">
        <div class="grow">
            test
        </div>
        <div class="w-full flex items-center justify-center p-2">
            <ChatMessageInput />
        </div>
    </div>
</template>
