<script setup lang="ts">
import type { Component } from 'vue';
import SidebarRouterLink from '../../RouterLink.vue';

const props = withDefaults(
    defineProps<{
        component?: Component | 'a';
    }>(),
    {
        component: SidebarRouterLink,
    },
);
</script>

<template>
    <div
        class="flex w-full rounded-lg h-8 bg-base-800 hover:bg-base-700 active:bg-base-600 has-[.router-link-active]:bg-base-600 cursor-pointer transition-all duration-dynamic">
        <component
            class="flex items-center justify-center grow rounded-lg"
            :is="props.component"
            active-class="router-link-active"
            v-bind="$attrs">
            <slot />
        </component>
    </div>
</template>
