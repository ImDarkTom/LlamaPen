<script setup lang="ts" generic="T = void">
import { ref } from 'vue';
import type { IconType } from 'vue-icons-plus';

const props = defineProps<{
    actions: MenuEntry<T>[];
    passArgs?: T;
}>();

type TextAction<T> = Extract<MenuEntry<T>, { type: 'text' }>;

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

const shownActions = computed(() => {
    return props.actions.filter((entry) => entry.condition === undefined || entry.condition === true);
});

const shownListLength = computed(() => shownActions.value.length);
</script>

<template>
    <FloatingMenu
        v-model:is-opened="isOpened"
        :unstyled-button="true"
        :unstyled-menu="true"
        :disabled="shownListLength === 0">
        <template #button>
            <slot
                :shownListLength
                :isOpened />
        </template>
        <template #menu>
            <ul class="min-w-36 p-1 mt-2 bg-base-700 rounded-lg shadow-elevation-4">
                <template v-for="entry in shownActions">
                    <li
                        v-if="entry.type === 'text'"
                        class="flex flex-row gap-2 items-center p-1.5 rounded-md cursor-pointer select-none hover:bg-base-600 transition-colors duration-dynamic"
                        :class="{
                            'hover:text-base-100': !entry.category || entry.category === 'general',
                            'hover:text-danger': entry.category === 'danger',
                        }"
                        @click="
                            entry.onClick(passArgs!);
                            isOpened = false;
                        ">
                        <component
                            v-if="entry.icon !== undefined"
                            :is="getIcon(entry.icon)"
                            class="inline size-5" />
                        <span class="mr-auto">
                            {{ getText(entry.text) }}
                        </span>
                        <UIKeyboardShortcutRenderer
                            v-if="entry.hotkey"
                            :hotkey="entry.hotkey" />
                    </li>
                    <div
                        v-else-if="entry.type === 'divider'"
                        class="w-[calc(100%-1.5rem)] h-px bg-base-400/75 my-1 mx-3"></div>
                </template>
            </ul>
        </template>
    </FloatingMenu>
</template>
