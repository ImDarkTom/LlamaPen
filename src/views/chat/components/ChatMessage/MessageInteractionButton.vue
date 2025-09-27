<script setup lang="ts">
import Tooltip from '@/components/Tooltip/Tooltip.vue';

defineProps<{
    text: string;
}>();
</script>

<template>
	<Tooltip class="box-border size-8 pointer-coarse:size-7 p-1.5 pointer-coarse:p-1 rounded-lg cursor-pointer hover:bg-background-light" :text >
        <slot></slot>
    </Tooltip>
</template>