<script setup lang="ts">
import { shallowRef, watchEffect } from 'vue';
import { useConfigStore } from '@/stores/config';
import { useModelIcon } from '@/composables/useModelIcon';
import Unknown from '@/icons/unknown.svg';

const props = defineProps<{
	name: string;
	forceMonochrome?: boolean;
	ignoreStyling?: boolean;
}>();

const config = useConfigStore();
const iconStore = useModelIcon();

const currentIcon = shallowRef<any>(Unknown);

async function loadIcon() {
	currentIcon.value = await iconStore.getIcon(props.name, props.forceMonochrome);
	console.log(currentIcon.value);
}

watchEffect(() => {
	// If any of the props change, re-run loading the icon, used for the messageInput icon
	loadIcon();
});
</script>

<template>
	<component :is="currentIcon" :class="{
		'bg-border-muted rounded-lg': !ignoreStyling && config.ui.modelIcons.background && config.ui.modelIcons.backgroundDark,
		'bg-border rounded-lg': !ignoreStyling && config.ui.modelIcons.background && !config.ui.modelIcons.backgroundDark
	}" />
</template>
