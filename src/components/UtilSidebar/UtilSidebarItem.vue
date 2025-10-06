<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';

defineProps<{
    to: string;
    text?: string;
    icon: IconType;
}>()
</script>

<template>
    <RouterLink :to class="group">
        <div class="flex p-2 hover:bg-surface rounded-md group-[.router-link-active]:text-text group-[.router-link-active]:ring-1 group-[.router-link-active]:bg-surface ring-highlight">
            <span class="items-center">
                <component :is="icon" class="inline-block" :class="{ 'mr-2': text }" />
                {{ text }}
            </span>
        </div>
    </RouterLink>
</template>