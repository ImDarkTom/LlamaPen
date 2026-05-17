<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { useModelIcon } from '@/composables/useModelIcon';

const props = defineProps<{
	name: string;
	ignoreStyling?: boolean;
}>();

const config = useConfigStore();
const { getIcon } = useModelIcon();

const icon = computed(() => getIcon(props.name, config.ui.modelIcons.monochrome));
const canHaveBackground = !props.ignoreStyling && config.ui.modelIcons.background;
</script>

<template>
	<component 
		:is="icon" 
		:class="{
			'bg-base-500 rounded-lg': canHaveBackground && config.ui.modelIcons.backgroundDark,
			'bg-base-400 rounded-lg': canHaveBackground && !config.ui.modelIcons.backgroundDark
		}" />
</template>