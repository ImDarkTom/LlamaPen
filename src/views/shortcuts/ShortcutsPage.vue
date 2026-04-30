<script setup lang="ts">
import router from '@/lib/router';
import setPageTitle from '@/utils/core/setPageTitle';
import { onBeforeUnmount, onMounted } from 'vue';

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
    *:mx-auto *:max-w-prose">
        <UIPageHeader text="Keyboard Shortcuts" />

        <div class="flex flex-col w-full h-full box-border">
            <h2 class="text-3xl font-semibold pb-2 text-base-100">Interface</h2>
            <ShortcutsPageDisplay label="Toggle sidebar" shortcut="ctrl shift s" />
            <ShortcutsPageDisplay label="Open model selector" shortcut="ctrl shift m" />
            <ShortcutsPageDisplay label="Search chats" shortcut="ctrl k" />
            <h2 class="text-3xl font-semibold pb-2 text-base-100">Chat</h2>
            <ShortcutsPageDisplay label="New chat" shortcut="ctrl shift o" />
            <ShortcutsPageDisplay label="Focus chat input" shortcut="shift esc" />
            <ShortcutsPageDisplay label="Pin chat" shortcut="shift alt p" />
            <ShortcutsPageDisplay label="Delete chat" shortcut="ctrl shift ⌫" />
        </div>
    </div>
</template>