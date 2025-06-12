<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
	type?: 'link' | 'button';
	wide?: boolean;
}>();
</script>

<template>
	<component :is="type === 'link' ? RouterLink : 'button'" class="!mx-auto !bg-primary-200 text-txt-2 p-4 rounded-lg hover:ring-1 ring-txt-2/50 cursor-pointer transition-all duration-150 w-1/2 text-center hover:text-txt-1">
		<slot></slot>
	</component>
</template>