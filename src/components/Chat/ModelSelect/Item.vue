<script setup lang="ts">
import router from '@/lib/router';
import useCloudUserStore from '@/stores/useCloudUserStore';
import { computed, ref } from 'vue';
import { BiBox, BiBrain, BiDotsHorizontalRounded, BiDotsVerticalRounded, BiHeart, BiLock, BiPencil, BiShow, BiSolidHeart, BiStar, BiWrench } from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/config';
import { useModelSelect } from '@/stores/useModelSelect';
import type { Model } from '@/providers/base/types';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';

const cloudUserStore = useCloudUserStore();
const config = useConfigStore();
const { getModelCapabilities } = useProviderManager();

const props = withDefaults(defineProps<{
	model: ModelInfo,
	index: number,
	isCurrentModel: boolean,
	selected: boolean,
	renameModel: () => void,
	layout?: 'row' | 'grid',
}>(), {
	layout: 'row',
});

const { setModel: setModelInfo } = useModelSelect();

const providerMetadata = computed(() => props.model.info.providerMetadata);

const actionMenuButton = ref<HTMLElement | null>(null);

function setModel(e: MouseEvent, model: Model) {
	if (actionMenuButton.value && actionMenuButton.value.contains(e.target as Node)) return;

	if (config.cloud.enabled && !cloudUserStore.isSignedIn) {
		// Show toast to sign in
		router.push('/account');
		return;
	} else if (providerMetadata.value?.provider === 'lpcloud' && providerMetadata.value.data.premium && !cloudUserStore.isPremium) {
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
	<!-- Row Layout -->
	<li 
		v-if="layout === 'row'" 
		class="relative group flex flex-row gap-3 ring-1 ring-base-500 ring-inset cursor-pointer p-3 hover:bg-base-600 transition-colors duration-dynamic rounded-lg overflow-x-hidden"
		:class="{
			'bg-base-600': selected && !isCurrentModel,
			'bg-base-600 ring-base-300!': isCurrentModel,
			'opacity-50': providerMetadata?.provider === 'lpcloud' 
				&& ((providerMetadata.data.premium && !cloudUserStore.isPremium) || (config.cloud.enabled && !cloudUserStore.isSignedIn)),
		}" @click="setModel($event, model.info)" ref="listItemRef" :aria-selected="selected">

		<IconModel :name="model.info.id" class="size-10 min-w-10 p-1" />

		<div class="flex flex-col">
			<div class="flex flex-row items-center">
				<span 
					class="text-md font-semibold text-ellipsis whitespace-nowrap overflow-hidden text-base-100"
					:title="model.info.id"
				>
					{{ model.displayName}}
				</span>
				<div class="flex flex-row gap-2 ml-2 shrink-0 min-w-fit">
					<div 
						v-if="isFavorited()"
						class="bg-red-400/25 rounded-sm ring-1 ring-red-400 p-0.5"
						title="Favorited model">
						<BiHeart class="text-red-400 size-4" />
					</div>
					<template v-if="model.info.providerMetadata?.provider === 'lpcloud'">
						<div 
							v-if="model.info.providerMetadata.data.premium && !cloudUserStore.isPremium"
							class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 p-0.5"
							title="Premium model - requires LlamaPen Cloud Premium">
							<BiStar class="text-yellow-400 size-4" />
						</div>
						<div 
							v-if="model.info.providerMetadata.data.tags?.includes('closedSource')"
							class="bg-orange-400/25 rounded-sm ring-1 ring-orange-400 p-0.5"
							title="Proprietary model - closed-source model that is not open-source.">
							<BiBox class="text-orange-400 size-4" />
						</div>
					</template>
					<!-- Capability tags -->
					<div 
						v-if="modelCapabilities.supportsVision"
						class="bg-capability-vision/25 rounded-sm ring-1 ring-capability-vision p-0.5"
						title="Vision - can process images">
						<BiShow class="text-capability-vision size-4" />
					</div>
					<div 
						v-if="modelCapabilities.supportsReasoning"
						class="bg-capability-reasoning/25 rounded-sm ring-1 ring-capability-reasoning p-0.5 flex flex-row"
						:title="providerMetadata?.provider === 'lpcloud' && providerMetadata.data.tags?.includes('alwaysReasons') 
							? 'Locked reasoning - always uses reasoning capabilities' 
							: 'Thinking - toggleable enhanced reasoning capabilities'">
						<BiBrain class="text-capability-reasoning size-4" />
						<BiLock
							v-if="providerMetadata?.provider === 'lpcloud' && providerMetadata?.data.tags?.includes('alwaysReasons')"
							class="text-capability-reasoning size-4" />
					</div>
					<div 
						v-if="modelCapabilities.supportsFunctionCalling"
						class="bg-capability-tools/25 rounded-sm ring-1 ring-capability-tools p-0.5"
						title="Tools - can use external tools">
						<BiWrench class="text-capability-tools size-4" />
					</div>
				</div>
			</div>
			<span class="text-sm text-base-200">{{ model.info.subtitle }}</span>
			<div class="absolute hidden items-center justify-center right-0 top-0 h-full w-16 bg-linear-to-r from-transparent to-base-600 group-hover:flex"
				:class="{ 
					'flex!': selected,
					'to-base-400!': isCurrentModel,
				}">
				<FloatingActionMenu :actions="selectActions">
					<div
						ref="actionMenuButton"
						class="p-1 ring-2 ring-base-200 hover:ring-base-100 hover:text-base-100 rounded-md">
						<BiDotsVerticalRounded class="size-8" />
					</div>
				</FloatingActionMenu>
			</div>
		</div>
	</li>
	<li 
		v-else
		class="relative group flex flex-col gap-2 ring-1 ring-base-500 ring-inset cursor-pointer p-2 hover:bg-base-600 transition-colors duration-dynamic rounded-lg overflow-x-visible"
		:class="{
			'bg-base-600': selected && !isCurrentModel,
			'bg-base-600 ring-base-300!': isCurrentModel,
			'opacity-50': providerMetadata?.provider === 'lpcloud' 
				&& ((providerMetadata.data.premium && !cloudUserStore.isPremium) || (config.cloud.enabled && !cloudUserStore.isSignedIn)),
		}" @click="setModel($event, model.info)" ref="listItemRef" :aria-selected="selected">

		<div class="flex flex-col items-center">
            <IconModel :name="model.info.id" class="size-10 p-1" />
			<span
				class="text-md font-semibold text-sm text-center overflow-hidden text-base-100"
				:title="model.info.id"
			>
				{{ model.displayName }}
			</span>
			<span class="text-xs text-base-200">{{ model.info.subtitle }}</span>
            <div class="flex flex-row flex-wrap justify-center gap-2 shrink-0 min-w-fit">
				<div 
					v-if="isFavorited()"
					class="bg-red-400/25 rounded-sm ring-1 ring-red-400 p-0.5"
					title="Favorited model">
					<BiHeart class="text-red-400 size-4" />
				</div>
				<template v-if="providerMetadata?.provider === 'lpcloud'">
					<div 
						v-if="providerMetadata.data.premium && !cloudUserStore.isPremium"
						class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 p-0.5"
						title="Premium model - requires LlamaPen Cloud Premium">
						<BiStar class="text-yellow-400 size-4" />
					</div>
					<div 
						v-if="providerMetadata.data.tags?.includes('closedSource')"
						class="bg-orange-400/25 rounded-sm ring-1 ring-orange-400 p-0.5"
						title="Proprietary model - closed-source model that is not open-source.">
						<BiBox class="text-orange-400 size-4" />
					</div>
				</template>
				<!-- Capability tags -->
				<div 
					v-if="modelCapabilities.supportsVision"
					class="bg-capability-vision/25 rounded-sm ring-1 ring-capability-vision p-0.5"
					title="Vision - can process images">
					<BiShow class="text-capability-vision size-4" />
				</div>
				<div 
					v-if="modelCapabilities.supportsReasoning"
					class="bg-capability-reasoning/25 rounded-sm ring-1 ring-capability-reasoning p-0.5 flex flex-row"
					:title="providerMetadata?.provider === 'lpcloud' && providerMetadata.data.tags?.includes('alwaysReasons') 
						? 'Locked reasoning - always uses reasoning capabilities' 
						: 'Thinking - toggleable enhanced reasoning capabilities'">
					<BiBrain class="text-capability-reasoning size-4" />
					<BiLock
						v-if="providerMetadata?.provider === 'lpcloud' && providerMetadata?.data.tags?.includes('alwaysReasons')"
						class="text-capability-reasoning size-4" />
				</div>
				<div 
					v-if="modelCapabilities.supportsFunctionCalling"
					class="bg-capability-tools/25 rounded-sm ring-1 ring-capability-tools p-0.5"
					title="Tools - can use external tools">
					<BiWrench class="text-capability-tools size-4" />
				</div>
			</div>
			<div class="absolute hidden items-center justify-center -right-1 -top-1 size-8 group-hover:flex">
				<FloatingActionMenu :actions="selectActions">
					<div
						v-if="selected"
						ref="actionMenuButton"
						class="p-0.5 bg-base-600 ring-1 ring-base-200 hover:ring-base-100 hover:text-base-100 rounded-md">
						<BiDotsVerticalRounded class="size-6" />
					</div>
				</FloatingActionMenu>
			</div>
		</div>
	</li>
</template>