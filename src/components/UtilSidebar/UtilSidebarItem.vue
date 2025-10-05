<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';

defineProps<{
    to: string;
    text?: string;
    icon: IconType;
}>()
</script>

<template>
    <RouterLink :to active-class="group enabled">
        <div class="flex p-2 hover:bg-surface rounded-md group-[.enabled]:ring-1 group-[.enabled]:bg-surface ring-border-muted">
            <span class="items-center">
                <component :is="icon" class="inline-block" :class="{ 'mr-2': text }" />
                {{ text }}
            </span>
        </div>
    </RouterLink>
</template>