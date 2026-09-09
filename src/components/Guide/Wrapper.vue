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

function handleClick(event: MouseEvent) {
    const link = (event.target as HTMLElement).closest('a');
    const href = link?.getAttribute('href');

    if (!href?.startsWith('/')) return;

    event.preventDefault();
    router.push(href);
}
</script>

<template>
    <div class="mx-auto h-full overflow-y-auto py-12">
        <article
            v-if="html"
            class="flex flex-col max-w-prose mx-auto p-2 md:p-0"
            v-html="props.html"
            @click="handleClick" />
        <article
            v-else
            class="flex flex-col max-w-prose mx-auto p-2 md:p-0">
            <slot />
        </article>
    </div>
</template>
