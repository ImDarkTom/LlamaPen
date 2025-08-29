<script setup lang="ts">
import ModelIcon from '@/components/Icon/ModelIcon.vue';

defineProps<{
    modelId: string;
    modelName: string;
    regenerateMessage: (model: string) => void;
}>();
</script>

<template>
    <button 
        :title="modelId"
        class="p-2 hover:scale-[98%] ring-1 ring-border-muted hover:ring-border hover:bg-surface-light hover:text-text rounded-lg w-full min-w-48 cursor-pointer transition-all duration-dynamic flex flex-row items-center justify-start"
        @mouseup="regenerateMessage(modelId)" >
        <ModelIcon :name="modelId" class="size-6 mr-2" />
        {{ modelName }}
    </button>
</template>