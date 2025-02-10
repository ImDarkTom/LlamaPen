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
    <textarea class="bg-primary-300 border-none outline-none p-4 !m-4 box-border rounded-xl resize-y shadow-md" :value="messageText" ref="editorRef" @keyup="onKeyUp"></textarea>
</template>