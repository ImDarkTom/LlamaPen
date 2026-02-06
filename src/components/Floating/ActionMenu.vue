<script setup lang="ts" generic="T = void">
import { ref } from 'vue';
import type { IconType } from 'vue-icons-plus';

const props = defineProps<{
    actions: MenuEntry<T>[];
    passArgs?: T;
}>();

type TextAction<T> = Extract<MenuEntry<T>, { type: 'text' }>

const getText = (text: TextAction<T>['text']): string => {
    if (typeof text === 'string') {
        return text;
    }

    return (text as (args: T) => string)(props.passArgs!);
};

const getIcon = (icon: TextAction<T>['icon']): IconType | undefined => {
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
            <ul class="min-w-36 p-1 mt-2 bg-surface rounded-lg shadow-elevation-4">
                <template v-for="entry in actions">
                    <li
                        v-if="entry.type === 'text' && (entry.condition === undefined || entry.condition === true)"
                        class="flex flex-row gap-2 items-center p-1.5 rounded-md cursor-pointer select-none hover:bg-surface-light transition-colors duration-dynamic" 
                        :class="{ 
                            'hover:text-text': !entry.category || entry.category === 'general',
                            'hover:text-danger': entry.category === 'danger',
                        }"
                        @click="entry.onClick(passArgs!); isOpened = false;">
                        <component 
                            v-if="entry.icon !== undefined" 
                            :is="getIcon(entry.icon)" 
                            class="inline size-5" />
                        <span>
                            {{ getText(entry.text) }}
                        </span>
                    </li>
                    <div 
                        v-else-if="entry.type === 'divider'"
                        class="w-[calc(100%-1.5rem)] h-px bg-border/75 my-1 mx-3"></div>
                </template>
            </ul>
        </template>
    </FloatingMenu>
</template>