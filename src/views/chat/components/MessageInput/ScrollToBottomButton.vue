<script setup lang="ts">
import { ref, watch } from 'vue';
import { emitter } from '@/lib/mitt';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();

const showButton = ref<boolean>(false);

watch(uiStore.chat, () => {
    showButton.value = !uiStore.chat.isScrollingDown;
});
</script>

<template>
    <span v-if="showButton" @click="emitter.emit('scrollToBottom', { force: true })"
        class="absolute -top-12 -translate-x-0 bg-surface-light p-2 rounded-lg select-none cursor-pointer shadow-sm shadow-black"
    >
        Scroll to bottom ↓
    </span>
</template>