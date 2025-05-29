<script setup lang="ts">
import Tooltip from '@/components/Tooltip/Tooltip.vue';

defineProps<{
    text: string;
}>();
</script>

<template>
	<Tooltip class="box-border size-9 p-2 mt-1 rounded-lg cursor-pointer hover:bg-primary-400" :text="text">
        <slot></slot>
    </Tooltip>
</template>