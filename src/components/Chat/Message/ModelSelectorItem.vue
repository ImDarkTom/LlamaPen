<script setup lang="ts">
const props = defineProps<{
    modelId: string;
    modelName: string;
    regenerateMessage: (model: string) => void;
}>();

function onClick() {
    props.regenerateMessage(props.modelId);
}

</script>

<template>
    <button 
        :title="modelId"
        class="p-2 ring-1 ring-base-500 rounded-lg w-full min-w-48 transition-all duration-dynamic flex flex-row items-center justify-start hover:scale-[98%] hover:ring-base-400 hover:bg-base-600 hover:text-base-100 cursor-pointer"
        @click="onClick" >
        <IconModel :name="modelId" class="size-6 mr-2" />
        {{ modelName }}
    </button>
</template>