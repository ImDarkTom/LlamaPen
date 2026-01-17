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
	qwen: 'qwen',
	qwq: 'qwen',
	mistral: 'mistral',
	mixtral: 'mistral',
	codestral: 'mistral',
	'gpt': 'openai',
	'phi': 'microsoft',
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
};

function getSlug(): string {
	// In the case a ModelMessage has no model, without this check it break rendering this component
	if (!props.name) return 'unknown';

	for (const key in modelIconMap) {
		if (props.name.includes(key)) {
			return modelIconMap[key];
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
		'bg-border-muted rounded-lg': !ignoreStyling && config.ui.modelIcons.background && config.ui.modelIcons.backgroundDark,
		'bg-border rounded-lg': !ignoreStyling && config.ui.modelIcons.background && !config.ui.modelIcons.backgroundDark
	}" />
</template>