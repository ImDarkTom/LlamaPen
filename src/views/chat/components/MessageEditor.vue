<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';


defineProps<{
    messageText: string,
}>();

const emit = defineEmits(['onFinishEditing', 'onCancelEdit']);

const editorRef = ref<HTMLTextAreaElement | null>(null);

onMounted(() => {
    document.addEventListener('keyup', onKeyUp);
})

onBeforeUnmount(() => {
    document.removeEventListener('keyup', onKeyUp);
});

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
    <textarea class="bg-surface border-none outline-none p-4 !m-2 box-border rounded-xl resize-y shadow-sm shadow-black" :value="messageText" ref="editorRef" @keyup="onKeyUp"></textarea>
</template>