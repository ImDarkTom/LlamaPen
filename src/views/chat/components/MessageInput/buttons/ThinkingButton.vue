<script setup lang="ts">
import { BiBrain } from 'vue-icons-plus/bi';

defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])

</script>

<template>
    <div class="aspect-square msg-input-secondary-btn !p-0 " :class="{ 'bg-primary ring-background! text-background!': modelValue }"
        title="Enable thinking">
        <label for="thinking-toggle" class="cursor-pointer size-full flex items-center justify-center">
            <BiBrain />
        </label>
        <input type="checkbox" id="thinking-toggle" class="hidden" :value="modelValue"
            @input="emits('update:modelValue', ($event.target as HTMLInputElement).checked)" />
    </div>
</template>