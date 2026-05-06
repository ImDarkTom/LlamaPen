<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import Unknown from '@/icons/unknown.svg';

const config = useConfigStore();

const allIcons = import.meta.glob('@/icons/*.svg', { eager: true });
const availableIcons: Record<string, Object> = {
	'unknown': Unknown,
	'unknown-color': Unknown
};

for (const [componentPath, moduleImport] of Object.entries(allIcons)) {
	// Get filename
	const iconSlug = componentPath.split('/').pop()?.replace('.svg', '');
	if (iconSlug) {
		availableIcons[iconSlug] = (moduleImport as { default: Object }).default;
	}
}

const props = defineProps<{
	name: string;
	ignoreStyling?: boolean;
	forceMonochrome?: boolean;
}>();

const modelIconMap: Record<string, string> = {
	llama: 'meta',
	gemma: config.ui.modelIcons.alternateGemmaIcon ? 'google' : 'gemma',
	gemini: 'gemini',
	deepseek: 'deepseek',
	'r1-1776': 'deepseek',
	'deepscaler': 'deepseek',
	'openthinker': 'deepseek',
	qwen: 'qwen',
	qwq: 'qwen',
	mistral: 'mistral',
	mixtral: 'mistral',
	devstral: 'mistral',
	codestral: 'mistral',
	ministral: 'mistral',
	magistral: 'mistral',
	mathstral: 'mistral',
	'gpt': 'openai',
	'phi': 'microsoft',
	'orca': 'microsoft',
	llava: 'llava',
	nemotron: 'nvidia',
	deepcoder: 'together',
	'z.ai': 'zai',
	zai: 'zai',
	glm: 'zai',
	hunyuan: 'hunyuan',
	moonshot: 'moonshot',
	kimi: 'moonshot',
	grok: 'grok',
	minimax: 'minimax',
	granite: 'ibm',
	cogito: 'deepcogito',
	exaone: 'lg',
	command: 'cohere',
	snowflake: 'snowflake',
	yi: 'yi',
	nous: 'nousresearch',
	hermes: 'nousresearch',
	'stable-code': 'stability',
};

function getSlug(): string {
	// In the case a ModelMessage has no model, without this check it break rendering this component
	if (!props.name) return 'unknown';

	for (const [key, icon] of Object.entries(modelIconMap)) {
		if (props.name.includes(key)) {
			return icon;
		}
	}

	return 'unknown';
}

function getIconComponent() {
	const slug = getSlug();
	const slugFormated = config.ui.modelIcons.monochrome || props.forceMonochrome ? slug : `${slug}-color`;

	return availableIcons[slugFormated];
}
</script>

<template>
	<component :is="getIconComponent()" :class="{
		'bg-base-500 rounded-lg': !ignoreStyling && config.ui.modelIcons.background && config.ui.modelIcons.backgroundDark,
		'bg-base-400 rounded-lg': !ignoreStyling && config.ui.modelIcons.background && !config.ui.modelIcons.backgroundDark
	}" />
</template>