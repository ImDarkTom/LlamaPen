<script setup lang="ts">
import router from '@/lib/router';
import useUserStore from '@/stores/user';
import ModelIcon from '../Icon/ModelIcon.vue';
import { computed, ref } from 'vue';
import { BiBrain, BiDotsHorizontalRounded, BiDotsVerticalRounded, BiGlobe, BiHeart, BiLock, BiShow, BiSolidBox, BiSolidHeart, BiStar, BiWrench } from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/config';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import ActionMenu, { type MenuEntry } from '../FloatingMenu/ActionMenu.vue';
import { useModelSelect } from '@/stores/useModelSelect';

const userStore = useUserStore();
const config = useConfigStore();
const { getModelCapabilities } = useModelList();

const props = defineProps<{
	model: ModelInfoListItem,
	index: number,
	isCurrentModel: boolean,
	selected: boolean,
}>();

const { setModel: setModelInfo } = useModelSelect();

const actionMenuButton = ref<HTMLElement | null>(null);

function setModel(e: MouseEvent, model: ModelListItem) {
	if (actionMenuButton.value && actionMenuButton.value.contains(e.target as Node)) return;

	if (config.cloud.enabled && !userStore.isSignedIn) {
		// Show toast to sign in
		router.push('/account');
		return;
	} else if (model.llamapenMetadata?.premium && !userStore.isPremium) {
		// Show toast to check out premium
		router.push('/account#plan');
		return;
	}

	setModelInfo(model);
}

const listItemRef = ref<HTMLLIElement | null>(null);
defineExpose({
	listItemRef
});

const isFavorited = () => config.models.favoriteModels.includes(props.model.modelData.model);

const modelCapabilities = computed(() => getModelCapabilities(props.model));

const favoriteModel = () => {
	const modelId = props.model.modelData.model;
	if (isFavorited()) {
		config.models.favoriteModels = config.models.favoriteModels.filter(m => m !== modelId);
	} else {
		config.models.favoriteModels.push(modelId);
	}
};

const selectActions: MenuEntry[] = [
	{
		text: () => isFavorited() ? 'Unfavorite' : 'Favorite',
		icon: () => isFavorited() ? BiSolidHeart : BiHeart,
		onClick: favoriteModel
	},
	{
		text: 'Manage Model',
		icon: BiDotsHorizontalRounded,
		onClick: () => router.push(`/models/${props.model.modelData.model}`)
	}
];
</script>

<template>
	<li class="relative group flex flex-col gap-2 ring-1 ring-border-muted ring-inset cursor-pointer p-2 hover:bg-surface-light transition-colors duration-dynamic rounded-lg overflow-x-visible"
		:class="{
			'bg-surface-light': selected && !isCurrentModel,
			'bg-surface-light ring-highlight!': isCurrentModel,
			'opacity-50': (!userStore.isPremium && model.modelData.llamapenMetadata?.premium) || (config.cloud.enabled && !userStore.isSignedIn),
		}" @click="setModel($event, model.modelData)" ref="listItemRef" :aria-selected="selected">

		<div class="flex flex-col items-center">
            <ModelIcon :name="model.modelData.model" class="size-10 p-1" />
			<span
				class="text-md font-semibold text-sm text-center overflow-hidden text-text"
				:title="model.modelData.model"
			>
				{{ model.displayName}}
			</span>
			<span class="text-xs text-text-muted">{{ model.modelData.details.parameter_size }}</span>
            <div class="flex flex-row flex-wrap justify-center gap-2 shrink-0 min-w-fit">
				<div 
					v-if="isFavorited()"
					class="bg-red-400/25 rounded-sm ring-1 ring-red-400 p-0.5"
					title="Favorited model">
					<BiHeart class="text-red-400 size-4" />
				</div>
				<div 
					v-if="model.modelData.llamapenMetadata?.premium"
					class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 p-0.5"
					title="Premium model - requires LlamaPen Cloud Premium">
					<BiStar class="text-yellow-400 size-4" />
				</div>
				<div 
					v-if="model.modelData.llamapenMetadata?.tags?.includes('closedSource')"
					class="bg-orange-400/25 rounded-sm ring-1 ring-orange-400 p-0.5"
					title="Proprietary model - closed-source model that is not open-source.">
					<BiSolidBox class="text-orange-400 size-4" />
				</div>
				<!-- Capability tags -->
				<div 
					v-if="modelCapabilities.includes('vision')"
					class="bg-green-400/25 rounded-sm ring-1 ring-green-400 p-0.5"
					title="Vision - can process images">
					<BiShow class="text-green-400 size-4" />
				</div>
				<div 
					v-if="modelCapabilities.includes('thinking')"
					class="bg-violet-400/25 rounded-sm ring-1 ring-violet-400 p-0.5 flex flex-row"
					:title="model.modelData.llamapenMetadata?.tags?.includes('alwaysReasons') 
						? 'Locked reasoning - always uses reasoning capabilities' 
						: 'Thinking - toggleable enhanced reasoning capabilities'">
					<BiBrain class="text-violet-400 size-4" />
					<BiLock
						v-if="model.modelData.llamapenMetadata?.tags?.includes('alwaysReasons')"
						class="text-violet-400 size-4" />
				</div>
				<div 
					v-if="modelCapabilities.includes('tools')"
					class="bg-blue-400/25 rounded-sm ring-1 ring-blue-400 p-0.5"
					title="Tools - can use external tools">
					<BiWrench class="text-blue-400 size-4" />
				</div>
				<div 
					v-if="modelCapabilities.includes('search')"
					class="bg-violet-400/25 rounded-sm ring-1 ring-pink-400 p-0.5"
					title="Web search - can access and search the web">
					<BiGlobe class="text-pink-400 size-4" />
				</div>
			</div>
			<div class="absolute hidden items-center justify-center -right-1 -top-1 size-8 group-hover:flex">
				<ActionMenu :actions="selectActions">
					<Transition name="layout-to-chat">
						<div
							v-if="selected"
							ref="actionMenuButton"
							class="p-0.5 bg-surface-light ring-1 ring-text-muted hover:ring-text hover:text-text rounded-md">
							<BiDotsVerticalRounded class="size-6" />
						</div>
					</Transition>
				</ActionMenu>
			</div>
		</div>
	</li>
</template>