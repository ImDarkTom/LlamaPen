<script setup lang="ts">
defineProps<{
    text: string;
}>();
</script>

<template>
	<Tooltip :text size="small">
        <div class="size-8 pointer-coarse:size-7 p-1.5 pointer-coarse:p-1 rounded-lg cursor-pointer hover:bg-background-light">
            <slot />
        </div>
    </Tooltip>
</template>