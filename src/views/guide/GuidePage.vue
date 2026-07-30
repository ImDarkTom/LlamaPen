<script setup lang="ts">
import { renderMarkdown } from '@/lib/marked';
import setPageTitle from '@/utils/core/setPageTitle';
import { onMounted } from 'vue';

onMounted(() => {
    setPageTitle('Guides');
});

const text = `
# Guides

The sidebar contains links to pages that may be useful for you to get the app working or
to to fix common issues.
`;
</script>

<template>
    <GuideWrapper
        :html="renderMarkdown(text)"
        class="prose prose-app!" />
</template>
