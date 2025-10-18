<script setup lang="ts">
import { BiLinkExternal } from 'vue-icons-plus/bi';

defineProps<{
    href: string;
}>();

</script>

<template>
    <a class="text-secondary underline" :href target="_blank" rel="noopener noreferrer">
        <span class="align-middle">
            <slot />
        </span>
        <BiLinkExternal class="size-4 inline" />
    </a>
</template>