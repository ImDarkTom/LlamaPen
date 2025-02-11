<script setup lang="ts">
import { ImCancelCircle } from 'vue-icons-plus/im';
import { useAllChatsStore } from '../../../stores/allChats';
import { BiSolidSend } from 'vue-icons-plus/bi';

const allChats = useAllChatsStore();

function cancelGeneration() {
    allChats.isGenerating = false;
}

const emit = defineEmits(['startGeneration']);

const props = defineProps<{
    canGenerate: boolean,
}>();

function handleClick() {
    if (allChats.isGenerating) {
        cancelGeneration();
    } else {
        if (!props.canGenerate) {
            return;
        }
        
        emit('startGeneration');
    }
}

</script>

<template>
    <component :is="allChats.isGenerating ? ImCancelCircle : BiSolidSend" 
        class="bg-primary-100 p-2 box-content rounded-lg cursor-pointer"
        :class="{ 'opacity-50 !cursor-default': !canGenerate && !allChats.isGenerating }"
        @click="handleClick" />
</template>