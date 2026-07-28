<script setup lang="ts">
import router from '@/lib/router';
import { computed, ref } from 'vue';
import {
    BiCheck,
    BiDotsHorizontalRounded,
    BiDotsVerticalRounded,
    BiHeart,
    BiPencil,
    BiSolidHeart,
} from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/useConfigStore';
import { useModelSelect } from '@/stores/useModelSelect';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';

const config = useConfigStore();
const { getModelCapabilities } = useProviderManager();

const props = defineProps<{
    model: ModelInfo;
    index: number;
    isCurrentModel: boolean;
    selected: boolean;
    renameModel: () => void;
}>();

const { setModel: setModelInfo } = useModelSelect();

const actionMenuButton = ref<HTMLElement | null>(null);

function setModel(e: MouseEvent, modelId: string) {
    if (actionMenuButton.value && actionMenuButton.value.contains(e.target as Node)) return;

    setModelInfo(modelId);
}

const listItemRef = ref<HTMLLIElement | null>(null);
defineExpose({
    listItemRef,
});

const isFavorited = () => config.models.favoriteModels.includes(props.model.info.id);

const modelCapabilities = computed(() => getModelCapabilities(props.model.info.id));

const favoriteModel = () => {
    const modelId = props.model.info.id;
    if (isFavorited()) {
        config.models.favoriteModels = config.models.favoriteModels.filter((m) => m !== modelId);
    } else {
        config.models.favoriteModels.push(modelId);
    }
};

const selectActions: MenuEntry[] = [
    {
        type: 'text',
        text: () => (isFavorited() ? 'Unfavorite' : 'Favorite'),
        icon: {
            type: 'factory',
            func: () => (isFavorited() ? BiSolidHeart : BiHeart),
        },
        onClick: favoriteModel,
    },
    {
        type: 'text',
        text: 'Rename Model',
        icon: BiPencil,
        onClick: props.renameModel,
    },
    {
        type: 'text',
        text: 'Manage Model',
        icon: BiDotsHorizontalRounded,
        onClick: () => router.push(`/models/installed/${props.model.info.id}`),
    },
];
</script>

<template>
    <li
        class="relative group flex flex-row gap-3 ring-inset cursor-pointer p-2 hover:bg-base-600 transition-colors duration-dynamic rounded-lg overflow-x-hidden"
        ref="listItemRef"
        :class="{
            'bg-base-600': selected && !isCurrentModel,
        }"
        :aria-selected="selected"
        @click="setModel($event, model.info.id)">
        <IconModel
            :name="model.info.id"
            class="size-10 min-w-10 p-1" />

        <div class="flex flex-col">
            <div class="flex flex-row items-center">
                <span
                    class="text-sm font-medium text-ellipsis whitespace-nowrap overflow-hidden text-base-100"
                    :title="model.info.id">
                    {{ model.displayName }}
                </span>
                <ChatModelSelectItemBadges
                    class="ml-2"
                    :provider-metadata="model.info.providerMetadata"
                    :capabilities="modelCapabilities"
                    :is-favorited="isFavorited()" />
            </div>
            <span
                class="text-xs text-base-300"
                :class="{
                    'text-base-400': model.info.subtitle.length === 0,
                }"
                >{{ model.info.subtitle.length > 0 ? model.info.subtitle : 'Info Unavailable' }}</span
            >
            <div class="absolute flex items-center justify-center right-0 top-0 h-full w-16">
                <FloatingActionMenu :actions="selectActions">
                    <template #default="{ isOpened }">
                        <div
                            ref="actionMenuButton"
                            class="opacity-0 group-hover:opacity-100 bg-base-600 p-1.5 rounded-md hover:text-base-100 hover:bg-base-500 transition-opacity duration-dynamic"
                            :class="{
                                'bg-base-400! text-base-50! opacity-100!': isOpened,
                            }">
                            <BiDotsVerticalRounded class="size-5" />
                        </div>
                    </template>
                </FloatingActionMenu>
            </div>
        </div>
        <div
            v-if="isCurrentModel"
            class="ml-auto mr-2 min-h-full flex items-center text-primary transition-discrete duration-dynamic"
            :class="{
                'mr-12': selected,
            }">
            <BiCheck class="size-8" />
        </div>
    </li>
</template>
