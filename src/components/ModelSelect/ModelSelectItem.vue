<script setup lang="ts">
import router from '@/router';
import useUserStore from '@/stores/user';
import { AiFillStar, AiOutlineArrowRight, AiOutlineEye, AiOutlineTool } from 'vue-icons-plus/ai';
import { BsGlobe } from 'vue-icons-plus/bs';

import Unknown from '@/icons/unknown.svg';
import { useConfigStore } from '@/stores/config';

const allIcons = import.meta.glob('@/icons/*.svg', { eager: true });
const availableIcons: Record<string, any> = {
	'unknown': Unknown,
	'unknown-color': Unknown
};

for (const path in allIcons) {
	const match = path.match(/\/([\w-]+)\.svg$/);
	if (match) {
		const slug = match[1];
		availableIcons[slug] = (allIcons[path] as any).default;
	}
}

const userStore = useUserStore();
const config = useConfigStore();

defineProps<{
	model: ModelListItem,
	index: number,
	focusedItemIndex: number,
	queriedModelList: ModelList,
}>();

const emit = defineEmits<{
	(e: 'setModel', name: string): void,
}>();

function setModel(model: ModelListItem) {
	if (model.llamapenMetadata?.premium) {
		if (userStore.subscription.subscribed) {
			emit('setModel', model.model);
		} else {
			router.push('/account');
		}
	} else {
		emit('setModel', model.model);
	}
}

const modelIconMap: Record<string, string> = {
	llama: 'meta',
	gemma: 'gemma',
	gemini: 'gemini',
	deepseek: 'deepseek',
	qwen: 'qwen',
	qwq: 'qwen',
	mistral: 'mistral',
	mixtral: 'mistral',
	codestral: 'mistral',
	'gpt': 'openai',
	'phi': 'microsoft',
	llava: 'llava',
	nemotron: 'nvidia',
	deepcoder: 'together'
};

function getSlug(modelName: string) {
	for (const key in modelIconMap) {
		if (modelName.includes(key)) {
			return modelIconMap[key];
		}
	}

	return 'unknown';
}

function getIconComponent(modelName: string) {
	const slug = getSlug(modelName);

	const slugFormated = config.ui.monochromeModelIcons ? slug : `${slug}-color`;
	
	return availableIcons[slugFormated];
}
</script>

<template>
	<li class="relative group flex flex-row gap-3 cursor-pointer p-3 hover:bg-primary-400 transition-colors duration-75 rounded-lg overflow-x-hidden"
		:class="{
			'bg-primary-500 shadow-sm shadow-black/50': index === focusedItemIndex,
			'opacity-75': !userStore.subscription.subscribed && model.llamapenMetadata?.premium
		}" @click="setModel(model)" ref="listItemsRef" :aria-selected="index === focusedItemIndex">
		<component :is="getIconComponent(model.model)" class="size-10 p-1 before:text-red-500 before:scale-110"
			:class="{ 
				'bg-primary-600 rounded-lg': config.ui.modelIconsBg && config.ui.modelIconsBgDark,
				'bg-primary-50 rounded-lg': config.ui.modelIconsBg && !config.ui.modelIconsBgDark
			}" />
		<div class="flex flex-col">
			<div class="flex flex-row items-center justify-between">
				<div class="flex flex-row">
					<span class="text-md font-semibold text-ellipsis whitespace-nowrap overflow-hiddefont-bold"
						:class="{ 'text-yellow-50': model.llamapenMetadata?.premium }" :title="model.name">{{ model.name
						}}</span>
					<span v-if="model.llamapenMetadata?.premium"
						class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 size-5 ml-2 p-0.5">
						<AiFillStar class="text-yellow-400 size-4" />
					</span>
				</div>
				<div class="flex flex-row">
					<span v-if="model.capabilities?.includes('vision')"
						class="bg-green-400/25 rounded-sm ring-1 ring-green-400 size-5 ml-2 p-0.5">
						<AiOutlineEye class="text-green-400 size-4" />
					</span>
					<span v-if="model.capabilities?.includes('tools')"
						class="bg-blue-400/25 rounded-sm ring-1 ring-blue-400 size-5 ml-2 p-0.5">
						<AiOutlineTool class="text-blue-400 size-4" />
					</span>
					<span v-if="model.capabilities?.includes('search')"
						class="bg-violet-400/25 rounded-sm ring-1 ring-violet-400 size-5 ml-2 p-0.5">
						<BsGlobe class="text-violet-400 size-4" />
					</span>
				</div>
			</div>
			<span class="text-sm text-txt-2 ">{{ model.details.parameter_size }}</span>
			<div class="absolute hidden items-center justify-center right-0 top-0 h-full w-16 bg-gradient-to-r from-transparent to-primary-400 group-hover:flex transition-colors duration-75"
				:class="{ '!flex not-group-hover:!to-primary-500': index === focusedItemIndex, 'text-txt-2 group-hover:text-txt-1': index === focusedItemIndex }">
				<AiOutlineArrowRight class="size-8 " />
			</div>
		</div>
	</li>
</template>