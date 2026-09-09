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

## LlamaPen Cloud has been discontinued

The service is no longer available and all account information has been deleted. For
similar functionality without running models locally, set up OpenRouter with a free API
key by following the [free cloud models guide](/guide/openrouter/free-cloud-models).
`;
</script>

<template>
    <GuideWrapper
        :html="renderMarkdown(text)"
        class="prose prose-app!" />
</template>
