<script setup lang="ts">
import { ImCancelCircle } from 'vue-icons-plus/im';
import { useAllChatsStore } from '../../../stores/allChats';
import { BiSolidSend } from 'vue-icons-plus/bi';

const allChats = useAllChatsStore();

function cancelGeneration() {
    allChats.isGenerating = false;
}

const emit = defineEmits(['startGeneration']);

defineProps<{
    canGenerate: boolean,
}>();

</script>

<template>
    <ImCancelCircle 
        v-if="allChats.isGenerating" 
        class="action-button" 
        @click="cancelGeneration" 
        :class="{ 'disabled': !canGenerate && !allChats.isGenerating }" />
    <BiSolidSend 
        v-else 
        class="action-button" 
        @click="emit('startGeneration')"
        :class="{ 'disabled': !canGenerate && !allChats.isGenerating }" />
</template>

<style scoped lang="scss">
.action-button {
    background-color: var(--bg-3);
    padding: 0.5rem;
    box-sizing: content-box;
    border-radius: 0.5rem;
    cursor: pointer;

    &.disabled {
        opacity: 0.5;
        cursor: default;
    }
}
</style>