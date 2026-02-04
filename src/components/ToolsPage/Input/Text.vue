<script setup lang="ts">
const props = defineProps(['modelValue', 'label', 'placeholder']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <label>
        <span>{{ label }}</span>
        <input
            class="w-full p-4 tools-input"
            type="text"
            :placeholder
            :value="props.modelValue"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)">
    </label>
</template>