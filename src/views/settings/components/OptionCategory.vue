<script setup lang="ts">
defineProps<{
	label: string,
}>();
</script>

<template>
	<div class="bg-primary-400 w-full mb-4 *:px-2 box-border rounded-xl *:py-2 *:not-last:border-b-2 *:not-last:border-txt-2">
		<h2 class="text-2xl font-bold"> {{ label }} </h2>
		<slot></slot>
	</div>
</template>