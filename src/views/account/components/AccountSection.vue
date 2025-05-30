<script setup lang="ts">
defineProps<{
	title: string;
	flexDirection?: 'row' | 'col';
}>();
</script>

<template>
	<div class="flex flex-col bg-primary-300 w-full p-4 mt-4 rounded-xl">
		<h2 class="text-3xl font-semibold pb-4">{{ title }}</h2>
		<div class="flex" :class="`flex-${flexDirection || 'row'}`">
			<slot></slot>
		</div>
	</div>
</template>