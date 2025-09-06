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
    if (e.key === "Escape") {
        emit('onCancelEdit');
    }
}

function submit() {
    emit('onFinishEditing', editorRef.value?.value)
}

function focusEditor() {
    editorRef.value?.focus();
}

defineExpose({
    focusEditor
});
</script>

<template>
    <form 
        class="bg-surface rounded-xl shadow-sm shadow-black"
        @submit.prevent="submit" > 
        <textarea 
            class="border-none outline-none p-4 resize-y w-full" 
            :value="messageText" 
            ref="editorRef" 
            @keyup="onKeyUp"></textarea>
        <div class="min-w-full flex flex-row gap-2 justify-end p-2 font-medium">
            <button
                class="bg-highlight text-background-dark p-2 rounded-lg cursor-pointer"
                @click="emit('onCancelEdit')">
                Cancel
            </button>
            <button
                type="submit"
                class="bg-primary text-background-dark p-2 rounded-lg cursor-pointer">
                Send
            </button>
        </div>
    </form>
    <div class="text-center md:text-start text-sm pt-1">
        Note: Messages under this will be deleted.
    </div>
</template>