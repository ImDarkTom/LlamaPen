<script setup lang="ts">
const textareaRef = ref<HTMLTextAreaElement | null>(null);

function autoResize() {
    if (!textareaRef.value) return;

    const lines = textareaRef.value?.value.split('\n').length;

    textareaRef.value.rows = Math.min(lines, 6);
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
    // If non-shifted enter key press

    e.preventDefault();
    console.log('sending');
}

// todo: make this work
// const canGenerate = computed<boolean>(() => {
//     return textareaRef.value?.value.trim() !== '';
// });
</script>

<template>
    <div class="bg-background-light p-4 rounded-2xl w-3xl">
        <textarea
            ref="textareaRef"
            class="w-full resize-none outline-none"
            placeholder="Enter a message..."
            rows="1"
            @input="autoResize"
            @keydown="onKeyDown"
        />
        <Row class="w-full justify-end">
            <button
                class="size-10 p-2 box-border rounded-xl bg-primary/50 group hover:brightness-75 not-dark:hover:brightness-125"
                :class="{ '!bg-primary cursor-pointer': true }"
            >
                <Icon
                    name="mynaui:send-solid"
                    class="size-full! text-background-light! transition-all ease-in duration-100 translate-0 group-hover:translate-x-1.5 group-hover:-translate-y-1.5"
                />
            </button>
        </Row>
    </div>
</template>
