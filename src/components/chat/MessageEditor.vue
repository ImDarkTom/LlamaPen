<script setup lang="ts">
import { ref } from 'vue';


defineProps<{
    messageText: string,
}>();

const emit = defineEmits(['onFinishEditing', 'onCancelEdit']);

const editorRef = ref<HTMLTextAreaElement | null>(null);

function onKeyUp(e: KeyboardEvent) {
    if (e.shiftKey) {
        return;
    }

    if (e.key === "Escape") {
        emit('onCancelEdit');
        return;
    }

    if (e.key === "Enter") {
        emit('onFinishEditing', editorRef.value?.value)
    }
}
</script>

<template>
    <textarea :value="messageText" ref="editorRef" @keyup="onKeyUp"></textarea>
</template>

<style scoped lang="scss">
</style>