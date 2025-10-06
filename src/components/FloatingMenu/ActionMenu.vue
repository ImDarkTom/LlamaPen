<script setup lang="ts">
import { ref } from 'vue';
import FloatingMenu from './FloatingMenu.vue';
import type { IconType } from 'vue-icons-plus';

export type MenuEntry = {
    text: string | ((...args: any) => string);
    onClick: (...args: any) => void;
    icon?: IconType | ((...args: any) => IconType);
    category?: 'general' | 'danger',
    condition?: boolean,
}

defineProps<{
    actions: MenuEntry[];
    passArgs?: unknown;
}>();

const isOpened = ref(false);
</script>

<template>
    <FloatingMenu 
        v-model:is-opened="isOpened" 
        :unstyled-button="true" 
        :unstyled-menu="true" >
        <template #button>
            <slot />
        </template>
        <template #menu>
            <ul class="p-1 bg-surface mt-2 rounded-lg ring-1 ring-border shadow">
                <template v-for="entry in actions">
                    <li
                        v-if="entry.condition === undefined || entry.condition === true"
                        class="align-middle p-1.5 rounded-md cursor-pointer select-none hover:bg-surface-light transition-colors duration-dynamic" 
                        :class="{ 
                            'hover:text-text': !entry.category || entry.category === 'general',
                            'hover:text-danger': entry.category === 'danger',
                        }"
                        @click="entry.onClick(passArgs); isOpened = false;">
                        <component v-if="entry.icon" :is="typeof entry.icon === 'function' ? entry.icon(passArgs) : entry.icon" class="inline mr-2" />
                        <span>
                            {{ typeof entry.text === 'string' ? entry.text : entry.text(passArgs) }}
                        </span>
                    </li>
                </template>
            </ul>
        </template>
    </FloatingMenu>
</template>