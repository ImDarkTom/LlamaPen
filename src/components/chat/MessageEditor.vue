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
        e.preventDefault();
        emit('onFinishEditing', editorRef.value?.value)
    }
}

function focusEditor() {
    editorRef.value?.focus();
}

defineExpose({
    focusEditor
});
</script>

<template>
    <textarea :value="messageText" ref="editorRef" @keyup="onKeyUp"></textarea>
</template>

<style scoped lang="scss">
textarea {
    background-color: var(--bg-3);
    border: none;
    outline: none;
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 0.5rem;
    resize: vertical;

    @include mixin.shadow-medium;
}
</style>