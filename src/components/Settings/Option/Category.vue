<script setup lang="ts">
defineProps<{
	label: string,
}>();
</script>

<template>
	<div class="w-full">
		<h2 class="text-2xl font-bold text-base-100 mb-1">{{ label }}</h2>
		<div class="flex flex-col gap-2 bg-base-800 ring-base-400 ring-1 not-md:ring-inset p-3 rounded-xl">
			<slot></slot>
		</div>
	</div>
</template>