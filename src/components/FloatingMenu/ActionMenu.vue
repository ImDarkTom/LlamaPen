<script setup lang="ts" generic="T = void">
import { ref } from 'vue';
import FloatingMenu from './FloatingMenu.vue';
import type { IconType } from 'vue-icons-plus';

export type TextResolver<T> = T extends void 
    ? string | (() => string)
    : string | ((args: T) => string);

export type IconResolver<T> = T extends void
    ? IconType | { type: 'factory'; func: () => IconType }
    : IconType | { type: 'factory'; func: (args: T) => IconType };

export type OnClickHandler<T> = T extends void
    ? () => void
    : (args: T) => void;

export type MenuEntry<T = void> = {
    text: TextResolver<T>;
    onClick: OnClickHandler<T>;
    icon?: IconResolver<T>;
    category?: 'general' | 'danger',
    condition?: boolean,
}

const props = defineProps<{
    actions: MenuEntry<T>[];
    passArgs?: T;
}>();

const getText = (text: MenuEntry<T>['text']): string => {
    if (typeof text === 'string') {
        return text;
    }

    return (text as (args: T) => string)(props.passArgs!);
};

const getIcon = (icon: MenuEntry<T>['icon']): IconType | undefined => {
    if (!icon) return undefined;
    if (typeof icon === 'object' && 'func' in icon) {
        return (icon.func as (args: T) => IconType)(props.passArgs!);
    }

    return icon as IconType;
};

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
                        @click="entry.onClick(passArgs!); isOpened = false;">
                        <component 
                            v-if="entry.icon !== undefined" 
                            :is="getIcon(entry.icon)" 
                            class="inline mr-2" />
                        <span>
                            {{ getText(entry.text) }}
                        </span>
                    </li>
                </template>
            </ul>
        </template>
    </FloatingMenu>
</template>