<script setup lang="ts">
import { ref, watch } from 'vue';
import { emitter } from '../../mitt';
import { useUiStore } from '../../stores/UIStore';

const uiStore = useUiStore();

const showButton = ref<boolean>(false);

watch(uiStore.chatList, () => {
    showButton.value = !uiStore.chatList.isScrollingDown;
}); 
</script>

<template><span v-if="showButton" @click="emitter.emit('scrollToBottom')">Scroll to bottom ↓</span></template>

<style scoped lang="scss">
span {
    position: absolute;
    top: -3rem;
    left: 50%;
    transform: translate(-50%, 0);
    background-color: var(--bg-3);
    padding: 0.5rem;
    border-radius: 0.5rem;
    user-select: none;
    cursor: pointer;

    @include mixin.shadow-low;
}
</style>