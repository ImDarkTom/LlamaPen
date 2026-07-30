<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import { RouterLink } from 'vue-router';
import type IconMemoryUnload from '../Icon/MemoryUnload.vue';

type ComponentTypes = 'link' | 'button' | 'link-external';

const props = withDefaults(
    defineProps<{
        text: string;
        type?: ComponentTypes;
        icon?: IconType | string | typeof IconMemoryUnload;
        color?: 'primary' | 'danger' | 'tertiary' | 'ghost';
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
    'link-external': 'a',
    button: 'button',
};
</script>

<template>
    <component
        :is="componentTypes[type]"
        class="shrink-0 text-center rounded-lg not-disabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 active:scale-98 transition-all duration-dynamic"
        :class="{
            'bg-primary! text-on-primary! not-disabled:hover:bg-primary-hover! not-disabled:active:bg-primary-active!':
                color === 'primary',
            'bg-danger! text-on-primary! not-disabled:hover:saturate-200 not-disabled:hover:bg-danger!':
                color === 'danger',
            'bg-transparent text-base-200! not-disabled:hover:bg-base-800! group-[.active]:bg-base-700! [&.router-link-exact-active]:bg-base-700!':
                color === 'ghost',
            'bg-base-800! text-base-200! not-disabled:hover:bg-base-700! group-[.active]:bg-base-600!':
                color === 'tertiary',
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
