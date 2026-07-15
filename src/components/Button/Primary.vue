<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import { RouterLink } from 'vue-router';
import type IconMemoryUnload from '../Icon/MemoryUnload.vue';

type ComponentTypes = 'link' | 'button';

const props = withDefaults(
    defineProps<{
        text: string;
        type?: ComponentTypes;
        icon?: IconType | string | typeof IconMemoryUnload;
        color?: 'primary' | 'danger';
        iconPos?: 'left' | 'right';
        hideText?: boolean;
    }>(),
    {
        type: 'button',
        color: 'primary',
        hideText: false,
        iconPos: 'left',
    },
);

const componentTypes: Record<ComponentTypes, unknown> = {
    link: RouterLink,
    button: 'button',
};
</script>

<template>
    <component
        :is="componentTypes[type]"
        class="text-base-900 p-3 md:p-4 shrink-0 text-center rounded-lg not-disabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 transition-colors duration-dynamic"
        :class="{
            'bg-primary! not-disabled:hover:bg-secondary!': color === 'primary',
            'bg-danger! hover:saturate-200 hover:bg-danger!': color === 'danger',
        }"
        :title="hideText ? text : undefined">
        <span>
            <component
                v-if="icon && iconPos === 'left'"
                :is="icon"
                class="size-6 inline align-middle"
                :class="{ 'mr-2': !hideText }" />
            <span
                v-if="!hideText"
                class="align-middle">
                {{ text }}
            </span>
            <component
                v-if="icon && iconPos === 'right'"
                :is="icon"
                class="size-6 inline align-middle"
                :class="{ 'ml-2': !hideText }" />
        </span>
    </component>
</template>
