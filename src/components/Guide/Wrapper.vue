<script setup lang="ts">
import router from '@/lib/router';
import hljs from 'highlight.js';
import { onMounted } from 'vue';

const props = defineProps<{
    html?: string;
}>();

onKeyStroke('Escape', () => {
    if (document.activeElement?.tagName === 'BODY') {
        return;
    }

    router.back();
});

onMounted(() => {
    hljs.highlightAll();
});
</script>

<template>
    <div class="mx-auto h-full overflow-y-auto py-12">
        <article
            v-if="html"
            class="flex flex-col max-w-prose mx-auto p-2 md:p-0"
            v-html="props.html" />
        <article
            v-else
            class="flex flex-col max-w-prose mx-auto p-2 md:p-0">
            <slot />
        </article>
    </div>
</template>
