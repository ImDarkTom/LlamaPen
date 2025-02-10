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
        class="bg-primary-100 p-2 box-content rounded-lg cursor-pointer"
        @click="cancelGeneration" :class="{ 'opacity-50 !cursor-default': !canGenerate && !allChats.isGenerating }" />
    <BiSolidSend 
        v-else 
        class="bg-primary-100 p-2 box-content rounded-lg cursor-pointer"
        @click="emit('startGeneration')"
        :class="{ 'opacity-50 !cursor-default': !canGenerate && !allChats.isGenerating }" />
</template>