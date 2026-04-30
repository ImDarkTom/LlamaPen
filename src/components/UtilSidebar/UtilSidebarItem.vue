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
        <div class="flex p-2 hover:bg-base-800 rounded-md group-[.router-link-active]:bg-base-950! ring-base-300">
            <div class="flex flex-row items-center justify-center gap-2">
                <component 
                    :is="icon" 
                    class="inline-block size-5" />
                <span 
                    v-if="text" 
                    class="text-sm font-medium">
                    {{ text }}
                </span>
            </div>
        </div>
    </RouterLink>
</template>