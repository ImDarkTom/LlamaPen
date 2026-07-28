<script setup lang="ts">
const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
    modelValue: boolean;
    label: string;
    tooltip: string;
}>();

const updateValue = () => {
    emit('update:modelValue', !props.modelValue);
};

const id = useId();
</script>

<template>
    <div class="group relative w-full flex flex-row justify-between items-center transition-all duration-dynamic">
        <SettingsOptionText
            :label
            :for="id"
            :tooltip />

        <input
            type="checkbox"
            class="absolute right-5 hidden"
            :id
            :aria-label="label"
            :checked="modelValue"
            @change="updateValue" />

        <label
            class="w-12 h-6 flex items-center bg-base-700 group-hover:bg-base-600 rounded-full p-0.5 cursor-pointer"
            role="switch"
            tabindex="0"
            :class="{ 'bg-primary group-hover:bg-secondary': modelValue }"
            :for="id"
            :aria-checked="modelValue"
            @keydown.space.prevent="updateValue">
            <div
                class="size-5 bg-base-100 rounded-full transition-transform duration-dynamic"
                :class="{ 'translate-x-6': modelValue }"></div>
        </label>
    </div>
</template>
