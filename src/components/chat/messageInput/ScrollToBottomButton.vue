<script setup lang="ts">
import { ref, watch } from 'vue';
import { emitter } from '../../../mitt';
import { useUiStore } from '../../../stores/uiStore';

const uiStore = useUiStore();

const showButton = ref<boolean>(false);

watch(uiStore.chatList, () => {
    showButton.value = !uiStore.chatList.isScrollingDown;
}); 
</script>

<template>
    <span v-if="showButton" @click="emitter.emit('scrollToBottom')"
        class="absolute -top-12 -translate-x-0 bg-primary-300 p-2 rounded-lg select-none cursor-pointer shadow-sm shadow-black">Scroll
        to bottom ↓</span>
</template>