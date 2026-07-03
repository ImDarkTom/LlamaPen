<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import { RouterLink } from 'vue-router';
import type IconMemoryUnload from '../Icon/MemoryUnload.vue';

type ComponentTypes = 'link' | 'button';

const props = defineProps<
    | {
          text?: string;
          type?: ComponentTypes;
          icon: IconType | string | typeof IconMemoryUnload;
          color?: 'primary' | 'danger';
      }
    | {
          text: string;
          type?: ComponentTypes;
          icon?: IconType | string | typeof IconMemoryUnload;
          color?: 'primary' | 'danger';
      }
>();

const componentTypes: Record<ComponentTypes, unknown> = {
    link: RouterLink,
    button: 'button',
};
</script>

<template>
    <component
        :is="componentTypes[type ?? 'button']"
        class="text-base-900 p-3 md:p-4 shrink-0 text-center rounded-lg not-disabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 transition-colors duration-dynamic"
        :class="{
            'bg-primary! not-disabled:hover:bg-secondary!': color === 'primary' || !color,
            'bg-danger! hover:saturate-200 hover:bg-danger!': color === 'danger',
        }">
        <span>
            <component
                v-if="icon"
                :is="icon"
                class="size-6 inline align-middle"
                :class="{ 'mr-2': text }" />
            <span
                v-if="text"
                class="align-middle">
                {{ text }}
            </span>
        </span>
    </component>
</template>
