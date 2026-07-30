<script setup lang="ts">
import { renderMarkdown } from '@/lib/marked';
import setPageTitle from '@/utils/core/setPageTitle';

onMounted(() => {
    setPageTitle('Using free cloud models via OpenRouter');
});

const text = `
# Using free cloud models via OpenRouter

It is entirely possible to use LlamaPen without local models or per-token cloud APIs. 
This is possible thanks to OpenRouter, which provide free models as long as you have
an account and have created an API key. Limits are:

- 50 requests/day for all accounts
- 1000 requests/day for accounts with at least $10 deposited

LlamaPen already has an OpenRouter preset to make setup quick once you have an API key.

Some things to note are:

1. Availability fluctuates, so not all listed free models may be available all the time.
2. A lot of free providers will retain data for training purposes, which may not be ideal
for sensitive information.

For more info, visit the [free models page](https://openrouter.ai/collections/free-models)
on OpenRouter's website.
`;
</script>

<template>
    <GuideWrapper
        :html="renderMarkdown(text)"
        class="prose prose-app!" />
</template>
