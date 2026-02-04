<script setup lang="ts">
defineProps<{
    text: string
}>();
</script>

<template>
    <div class="flex items-center" role="separator">
        <div class="grow border-t border-border"></div>
        <span class="mx-2 font-medium">{{ text }}</span>
        <div class="grow border-t border-border"></div>
    </div>
</template>