<script setup lang="ts">
import { Label } from 'reka-ui';
import { BiHelpCircle } from 'vue-icons-plus/bi';

defineProps<{
    label: string;
    for: string;
    tooltip: string;
}>();
</script>

<template>
    <span class="text-lg text-base-200">
        <Tooltip
            :text="tooltip"
            size="small">
            <BiHelpCircle class="hover:text-base-100 inline align-middle mr-2 size-4" />
        </Tooltip>
        <Label
            class="align-middle hover:text-base-100"
            :for>
            {{ label }}
        </Label>
    </span>
</template>
