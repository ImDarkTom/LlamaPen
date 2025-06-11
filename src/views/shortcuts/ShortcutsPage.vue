<script setup lang="ts">
import router from '@/lib/router';
import setPageTitle from '@/utils/title';
import { onBeforeUnmount, onMounted } from 'vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import ShortcutDisplay from './components/ShortcutDisplay.vue';

onMounted(() => {
    setPageTitle('Keyboard Shortcuts');
    document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape);
});

function handleEscape(e: KeyboardEvent) {
    if (document.activeElement?.tagName === 'BODY') {
        return;
    }

    if (e.key === 'Escape') {
        router.back();
    }
}

</script>

<template>
    <div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
    *:mx-auto *:md:w-4/5 *:lg:w-3/5">
        <div class="relative w-full flex flex-row justify-between items-center">
            <h1 class="text-4xl font-extrabold mt-2 pr-3 bg-primary-400">Keyboard Shortcuts</h1>
            <div class="w-full h-0.5 bg-txt-1 absolute top-1/2 translate-y-1/2 -z-1 rounded-full"></div>
            <div class="bg-primary-400 pl-2 box-border">
                <AiOutlineClose
                    class="size-10 hover:bg-primary-300 cursor-pointer rounded-full p-1 transition-colors duration-100"
                    @click="router.back()" />
            </div>
        </div>

        <div class="flex flex-col h-full box-border">
            <h2 class="text-3xl font-semibold pb-2">Interface</h2>
            <ShortcutDisplay label="Toggle sidebar" shortcut="ctrl shift s" />
            <ShortcutDisplay label="Open model selector" shortcut="ctrl shift m" />
            <h2 class="text-3xl font-semibold pb-2">Chat</h2>
            <ShortcutDisplay label="New chat" shortcut="ctrl shift o" />
            <ShortcutDisplay label="Focus chat input" shortcut="shift esc" />
            <ShortcutDisplay label="Delete chat" shortcut="ctrl shift ⌫" />
            <h2 class="text-3xl font-semibold pb-2">Notes</h2>
            <ShortcutDisplay label="New note" shortcut="ctrl shift o" />
            <ShortcutDisplay label="Save note" shortcut="ctrl s" />
            <ShortcutDisplay label="Focus note textarea" shortcut="shift esc" />
            <ShortcutDisplay label="Delete note" shortcut="ctrl shift ⌫" />
        </div>
    </div>
</template>