<script setup lang="ts">
import { ref } from 'vue';
import FloatingMenu from './FloatingMenu.vue';
import type { IconType } from 'vue-icons-plus';

export type MenuEntry = {
    icon?: IconType;
    text: string;
    onClick: (...args: any) => void;
    category?: 'general' | 'danger', 
}

defineProps<{
    actions: MenuEntry[];
    passArgs?: unknown;
}>();

const isOpened = ref(false);

</script>

<template>
    <FloatingMenu v-model:is-opened="isOpened" :unstyled-button="true" :unstyled-menu="true">
        <template #button><slot /></template>
        <template #menu>
            <ul class="p-1 bg-surface my-2 rounded-lg ring-1 ring-border shadow">
                <li 
                    class="align-middle p-1 rounded-md cursor-pointer select-none hover:bg-surface-light transition-colors duration-dynamic" 
                    v-for="entry in actions" @click="entry.onClick(passArgs)"
                    :class="{ 
                        'hover:text-text': !entry.category || entry.category === 'general',
                        'hover:text-danger': entry.category === 'danger',
                    }">
                    <component v-if="entry.icon" :is="entry.icon" class="inline mr-2" />
                    <span>
                        {{ entry.text }}
                    </span>
                </li>
            </ul>
        </template>
    </FloatingMenu>
</template>