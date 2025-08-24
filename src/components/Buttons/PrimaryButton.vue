<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import { RouterLink } from 'vue-router';
import type MemoryUnloadIcon from '../Icon/MemoryUnloadIcon.vue';

type ComponentTypes = 'link' | 'button' | 'external-link';

defineProps<{
	text: string;
	type?: ComponentTypes;
	icon?: IconType | string | typeof MemoryUnloadIcon;
	singleLine?: boolean;
	color?: 'primary' | 'danger' | 'sunken';
}>();

const componentTypes: Record<ComponentTypes, unknown> = {
	link: RouterLink,
	button: 'button',
	"external-link": 'a'
}
</script>

<template>
	<component 
		:is="componentTypes[type ?? 'button']" 
		class="text-background p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-dynamic w-fit text-center transition-color duration-dynamic"
		:class="{
			'whitespace-nowrap': singleLine,
			'!bg-primary hover:!bg-secondary': color === 'primary' || !color,
			'!bg-danger hover:saturate-200 hover:bg-danger!': color === 'danger',
			'bg-border-muted text-text-muted': color === 'sunken',
		}"
		v-bind="type === 'external-link' ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
	>
		<span>
			<component v-if="icon" :is="icon" class="size-6 inline mr-2 align-middle" />
			<span class="align-middle">
				{{ text }}
			</span>
		</span>
	</component>
</template>