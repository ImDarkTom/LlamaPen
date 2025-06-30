<script setup lang="ts">
const props = defineProps<{
	label: string,
}>();

const formattedLabel = props.label.replace(/ /g, '-').toLowerCase();
</script>

<template>
	<section :id="formattedLabel" class="bg-background-light border-border border-2 w-full mb-4 *:p-2 box-border rounded-xl">
		<h2 class="text-2xl font-bold text-text">{{ label }}</h2>
		<div class="flex flex-col gap-2">
			<slot></slot>
		</div>
	</section>
</template>