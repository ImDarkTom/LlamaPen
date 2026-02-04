<script setup lang="ts">
import { BiHelpCircle } from 'vue-icons-plus/bi';

defineProps<{
    label: string;
    tooltip?: string;
}>();
</script>

<template>
    <span class="text-lg text-text-muted">
        <span class="align-middle hover:text-text">
            {{ label }}
        </span>
        <Tooltip v-if="tooltip" :text="tooltip" size="small">
            <BiHelpCircle class="hover:text-text inline align-middle ml-1 size-5" />
        </Tooltip>
    </span>
</template>