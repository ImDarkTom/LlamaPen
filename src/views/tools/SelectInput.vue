<script setup lang="ts">
const props = defineProps<{
    modelValue: any,
    label: string,
    options: string[],
}>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <label>
        <span>{{ label }}</span>
        <select 
            class="w-full bg-surface-light p-4 rounded-md"
            :value="props.modelValue"
            @input="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">>
            <option
                v-for="item in options"
                :value="item">
                {{ item }}
            </option>
        </select>
    </label>
</template>