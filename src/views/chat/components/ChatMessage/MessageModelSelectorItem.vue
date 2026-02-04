<script setup lang="ts">
const props = defineProps<{
    modelId: string;
    modelName: string;
    modelIsAvailable: boolean;
    regenerateMessage: (model: string) => void;
}>();

function onClick() {
    if (!props.modelIsAvailable) {
        return;
    }

    props.regenerateMessage(props.modelId);
}

</script>

<template>
    <button 
        :title="modelId"
        class="p-2 ring-1 ring-border-muted rounded-lg w-full min-w-48 transition-all duration-dynamic flex flex-row items-center justify-start"
        :class="{ 
            'hover:scale-[98%] hover:ring-border hover:bg-surface-light hover:text-text cursor-pointer': modelIsAvailable,
            'opacity-50': !modelIsAvailable
        }"
        @click="onClick" >
        <IconModel :name="modelId" class="size-6 mr-2" />
        {{ modelName }}
    </button>
</template>