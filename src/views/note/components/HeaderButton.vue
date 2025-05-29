<script setup lang="ts">
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();

defineProps<{
  label: string;
}>();

</script>

<template>
	<Tooltip :text="label" class="h-full">
		<button class="w-fit h-full p-2 rounded-lg bg-primary-200 hover:text-txt-2 cursor-pointer flex flex-row gap-2 items-center justify-center">
			<slot></slot>
			{{ config.note.showHeaderLabels ? label : '' }}
		</button>
	</Tooltip>
</template>