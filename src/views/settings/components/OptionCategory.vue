<script setup lang="ts">
const props = defineProps<{
	label: string,
}>();

const formattedLabel = props.label.replace(/ /g, '-').toLowerCase();
</script>

<template>
	<section :id="formattedLabel" class="bg-primary-300 w-full mb-4 *:px-2 box-border rounded-xl *:py-2 *:not-last:border-b-2 *:not-last:border-txt-2">
		<h2 class="text-2xl font-bold">{{ label }}</h2>
		<div class="flex flex-col gap-2">
			<slot></slot>
		</div>
	</section>
</template>