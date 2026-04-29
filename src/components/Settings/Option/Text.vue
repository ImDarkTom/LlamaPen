<script setup lang="ts">
import { BiHelpCircle } from 'vue-icons-plus/bi';

defineProps<{
    label: string;
    tooltip?: string;
}>();
</script>

<template>
    <span class="text-lg text-base-200">
        <span class="align-middle hover:text-base-100">
            {{ label }}
        </span>
        <Tooltip v-if="tooltip" :text="tooltip" size="small">
            <BiHelpCircle class="hover:text-base-100 inline align-middle ml-1 size-5" />
        </Tooltip>
    </span>
</template>