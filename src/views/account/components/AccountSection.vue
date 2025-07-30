<script setup lang="ts">
defineProps<{
	title?: string;
	flexDirection?: 'row' | 'col';
	apart?: boolean;
}>();
</script>

<template>
	<div class="flex flex-col bg-background-light border-2 border-border w-full p-4 mt-4 rounded-xl">
		<h2 v-if="title" class="text-3xl font-semibold pb-4 text-text">{{ title }}</h2>
		<div class="flex gap-4" :class="`flex-${flexDirection || 'row'} ${apart ? 'justify-between' : ''}`">
			<slot></slot>
		</div>
	</div>
</template>