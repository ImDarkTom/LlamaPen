<script setup lang="ts">
defineProps<{
    text: string
}>();
</script>

<template>
    <div class="flex items-center" role="separator">
        <div class="grow border-t border-base-400"></div>
        <span class="mx-2 font-medium">{{ text }}</span>
        <div class="grow border-t border-base-400"></div>
    </div>
</template>