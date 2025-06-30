<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
	type?: 'link' | 'button';
	wide?: boolean;
}>();
</script>

<template>
	<component :is="type === 'link' ? RouterLink : 'button'" class="!bg-primary text-background hover:!bg-secondary p-4 rounded-lg cursor-pointer transition-all duration-150 w-fit min-w-1/3 text-center">
		<slot></slot>
	</component>
</template>