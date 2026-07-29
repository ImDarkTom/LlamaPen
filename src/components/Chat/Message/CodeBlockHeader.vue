<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { BiCodeAlt, BiCopy } from 'vue-icons-plus/bi';

const props = defineProps<{
    language: string;
    code: string;
}>();

const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function copyCode() {
    await navigator.clipboard.writeText(decodeURIComponent(props.code));
    copied.value = true;

    resetTimer = setTimeout(() => {
        copied.value = false;
    }, 1000);
}

onBeforeUnmount(() => {
    if (resetTimer) clearTimeout(resetTimer);
});
</script>

<template>
    <div
        class="min-w-full bg-base-900 text-base-200 rounded-t-xl p-3 select-none flex flex-row border-b border-base-500 items-center">
        <BiCodeAlt class="mr-2 size-4" />
        <span class="text-sm font-medium">{{ decodeURIComponent(language) }}</span>
        <div class="grow"></div>
        <Tooltip
            size="small"
            :text="copied ? 'Copied!' : 'Copy'">
            <button
                class="bg-base-800 hover:bg-base-700 active:bg-base-600 p-2 rounded-md cursor-pointer text-xs! font-medium"
                @click="copyCode">
                <BiCopy class="size-5" />
            </button>
        </Tooltip>
    </div>
    <div class="bg-base-900 h-2 w-full"></div>
</template>
