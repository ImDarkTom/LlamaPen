<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import type { RouterLinkProps } from 'vue-router';

defineProps<{
    text: string;
    icon: IconType;
    to: RouterLinkProps['to'];
    badge?: string;
}>();
</script>

<template>
    <SidebarRouterLink :to class="group" active-class="router-link-active" >
        <div class="flex p-2 hover:bg-base-900 rounded-md text-base-300 group-[.router-link-active]:text-base-200! group-[.router-link-active]:bg-base-800!">
            <div class="flex flex-row items-center justify-center gap-2">
                <component 
                    :is="icon" 
                    class="inline-block size-5" />
                <span class="text-sm font-medium">
                    {{ text }}
                </span>
            </div>
            <div 
                v-if="badge"
                class="text-xs font-medium ml-auto bg-base-700 rounded-full size-5 flex items-center justify-center">
                {{ badge }}
            </div>
        </div>
    </SidebarRouterLink>
</template>