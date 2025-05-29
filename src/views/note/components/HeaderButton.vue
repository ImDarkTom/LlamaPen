<script setup lang="ts">
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();

defineProps<{
  label?: string;
}>();

</script>

<template>
	<button class="w-fit p-2 rounded-lg bg-primary-200 hover:text-txt-2 cursor-pointer flex flex-row gap-2 items-center justify-center">
		<slot></slot>
		{{ config.note.showHeaderLabels ? label : '' }}
	</button>
</template>