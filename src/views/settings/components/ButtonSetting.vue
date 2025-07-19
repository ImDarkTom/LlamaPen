<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
	type?: 'link' | 'button';
	wide?: boolean;
}>();
</script>

<template>
	<component :is="type === 'link' ? RouterLink : 'button'" class="!bg-primary text-background hover:!bg-secondary p-4 rounded-lg cursor-pointer transition-all duration-dynamic w-fit min-w-1/3 text-center flex flex-row gap-2 items-center justify-center">
		<slot></slot>
	</component>
</template>