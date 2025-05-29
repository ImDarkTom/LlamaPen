<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import Unknown from '@/icons/unknown.svg';

const config = useConfigStore();

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

const props = defineProps<{
	name: string;
	ignoreStyling?: boolean;
	forceMonochrome?: boolean;
}>();

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

function getSlug(): string {
	for (const key in modelIconMap) {
		if (props.name.includes(key)) {
			return modelIconMap[key];
		}
	}

	return 'unknown';
}

function getIconComponent() {
	const slug = getSlug();

	const slugFormated = config.ui.monochromeModelIcons || props.forceMonochrome ? slug : `${slug}-color`;

	return availableIcons[slugFormated];
}
</script>

<template>
	<component :is="getIconComponent()" :class="{
		'bg-primary-600 rounded-lg': !ignoreStyling && config.ui.modelIconsBg && config.ui.modelIconsBgDark,
		'bg-primary-50 rounded-lg': !ignoreStyling && config.ui.modelIconsBg && !config.ui.modelIconsBgDark
	}" />
</template>