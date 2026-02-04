<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import { BiLinkExternal } from 'vue-icons-plus/bi';

defineProps<{
    title: string;
    description: string;
    icon: IconType;
    link: string;
}>();
</script>

<template>
    <a :href="link" target="_blank" class="w-full flex flex-row gap-4 items-center border-2 border-border-muted rounded-lg p-4 hover:border-border transition-all duration-dynamic ">
        <component :is="icon" class="size-8" />
        <div class="flex flex-col gap-2">
            <span class="font-medium text-text flex flex-row items-center gap-2">{{ title }} <BiLinkExternal class="size-5" /></span>
            <span class="text-sm">{{ description }}</span>
        </div>
    </a>
</template>