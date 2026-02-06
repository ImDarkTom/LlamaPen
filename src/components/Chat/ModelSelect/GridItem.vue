<script setup lang="ts">
import router from '@/lib/router';
import useUserStore from '@/stores/user';
import { computed, ref } from 'vue';
import { BiBrain, BiDotsHorizontalRounded, BiDotsVerticalRounded, BiHeart, BiLock, BiPencil, BiShow, BiSolidBox, BiSolidHeart, BiStar, BiWrench } from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/config';
import { useModelSelect } from '@/stores/useModelSelect';
import type { Model } from '@/providers/base/types';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';

const userStore = useUserStore();
const config = useConfigStore();
const { getModelCapabilities }  = useProviderManager();

const props = defineProps<{
	model: ModelInfo,
	index: number,
	isCurrentModel: boolean,
	selected: boolean,
	renameModel: () => void
}>();

const { setModel: setModelInfo } = useModelSelect();

const providerMetadata = computed(() => props.model.info.providerMetadata);

const actionMenuButton = ref<HTMLElement | null>(null);

function setModel(e: MouseEvent, model: Model) {
	if (actionMenuButton.value && actionMenuButton.value.contains(e.target as Node)) return;

	if (config.cloud.enabled && !userStore.isSignedIn) {
		// Show toast to sign in
		router.push('/account');
		return;
	} else if (providerMetadata.value?.provider === 'lpcloud' && providerMetadata.value.data.premium && !userStore.isPremium) {
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

const isFavorited = () => config.models.favoriteModels.includes(props.model.info.id);

const modelCapabilities = computed(() => getModelCapabilities(props.model.info.id));

const favoriteModel = () => {
	const modelId = props.model.info.id;
	if (isFavorited()) {
		config.models.favoriteModels = config.models.favoriteModels.filter(m => m !== modelId);
	} else {
		config.models.favoriteModels.push(modelId);
	}
};

const selectActions: MenuEntry[] = [
	{
		type: 'text',
		text: () => isFavorited() ? 'Unfavorite' : 'Favorite',
		icon: {
			type: 'factory',
			func: () => isFavorited() ? BiSolidHeart : BiHeart
		},
		onClick: favoriteModel
	},
	{
		type: 'text',
		text: 'Rename Model',
		icon: BiPencil,
		onClick: props.renameModel
	},
	{
		type: 'text',
		text: 'Manage Model',
		icon: BiDotsHorizontalRounded,
		onClick: () => router.push(`/models/${props.model.info.id}`)
	}
];
</script>

<template>
	<li class="relative group flex flex-col gap-2 ring-1 ring-border-muted ring-inset cursor-pointer p-2 hover:bg-surface-light transition-colors duration-dynamic rounded-lg overflow-x-visible"
		:class="{
			'bg-surface-light': selected && !isCurrentModel,
			'bg-surface-light ring-highlight!': isCurrentModel,
			'opacity-50': providerMetadata?.provider === 'lpcloud' 
				&& ((providerMetadata.data.premium && !userStore.isPremium) || (config.cloud.enabled && !userStore.isSignedIn)),
		}" @click="setModel($event, model.info)" ref="listItemRef" :aria-selected="selected">

		<div class="flex flex-col items-center">
            <IconModel :name="model.info.id" class="size-10 p-1" />
			<span
				class="text-md font-semibold text-sm text-center overflow-hidden text-text"
				:title="model.info.id"
			>
				{{ model.displayName }}
			</span>
			<span class="text-xs text-text-muted">{{ model.info.subtitle }}</span>
            <div class="flex flex-row flex-wrap justify-center gap-2 shrink-0 min-w-fit">
				<div 
					v-if="isFavorited()"
					class="bg-red-400/25 rounded-sm ring-1 ring-red-400 p-0.5"
					title="Favorited model">
					<BiHeart class="text-red-400 size-4" />
				</div>
				<template v-if="providerMetadata?.provider === 'lpcloud'">
					<div 
						v-if="providerMetadata.data.premium"
						class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 p-0.5"
						title="Premium model - requires LlamaPen Cloud Premium">
						<BiStar class="text-yellow-400 size-4" />
					</div>
					<div 
						v-if="providerMetadata.data.tags?.includes('closedSource')"
						class="bg-orange-400/25 rounded-sm ring-1 ring-orange-400 p-0.5"
						title="Proprietary model - closed-source model that is not open-source.">
						<BiSolidBox class="text-orange-400 size-4" />
					</div>
				</template>
				<!-- Capability tags -->
				<div 
					v-if="modelCapabilities.supportsVision"
					class="bg-green-400/25 rounded-sm ring-1 ring-green-400 p-0.5"
					title="Vision - can process images">
					<BiShow class="text-green-400 size-4" />
				</div>
				<div 
					v-if="modelCapabilities.supportsReasoning"
					class="bg-violet-400/25 rounded-sm ring-1 ring-violet-400 p-0.5 flex flex-row"
					:title="providerMetadata?.provider === 'lpcloud' && providerMetadata.data.tags?.includes('alwaysReasons') 
						? 'Locked reasoning - always uses reasoning capabilities' 
						: 'Thinking - toggleable enhanced reasoning capabilities'">
					<BiBrain class="text-violet-400 size-4" />
					<BiLock
						v-if="providerMetadata?.provider === 'lpcloud' && providerMetadata?.data.tags?.includes('alwaysReasons')"
						class="text-violet-400 size-4" />
				</div>
				<div 
					v-if="modelCapabilities.supportsFunctionCalling"
					class="bg-blue-400/25 rounded-sm ring-1 ring-blue-400 p-0.5"
					title="Tools - can use external tools">
					<BiWrench class="text-blue-400 size-4" />
				</div>
			</div>
			<div class="absolute hidden items-center justify-center -right-1 -top-1 size-8 group-hover:flex">
				<FloatingActionMenu :actions="selectActions">
					<Transition name="layout-to-chat">
						<div
							v-if="selected"
							ref="actionMenuButton"
							class="p-0.5 bg-surface-light ring-1 ring-text-muted hover:ring-text hover:text-text rounded-md">
							<BiDotsVerticalRounded class="size-6" />
						</div>
					</Transition>
				</FloatingActionMenu>
			</div>
		</div>
	</li>
</template>