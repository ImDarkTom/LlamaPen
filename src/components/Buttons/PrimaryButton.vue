<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import { RouterLink } from 'vue-router';

defineProps<{
	text: string;
	type?: 'link' | 'button';
	wide?: boolean;
	icon?: IconType | string;
	color?: 'primary' | 'danger';
}>();
</script>

<template>
	<component 
		:is="type === 'link' ? RouterLink : 'button'" 
		class="text-background p-4 rounded-lg cursor-pointer transition-all duration-dynamic w-fit min-w-1/3 text-center"
		:class="{
			'!bg-primary hover:!bg-secondary': color === 'primary' || !color,
			'!bg-danger hover:saturate-200 hover:bg-danger!': color === 'danger',
		}"
	>
		<span>
			<component v-if="icon" :is="icon" class="size-6 inline mr-2 align-middle" />
			<span class="align-middle">
				{{ text }}
			</span>
		</span>
	</component>
</template>