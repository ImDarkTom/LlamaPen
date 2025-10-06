<script setup lang="ts">
import { ref, watch } from 'vue';
import OptionText from './OptionText.vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
    modelValue: number;
    label: string;
    default: number;
    min?: number;
    max?: number;
    tooltip?: string;
}>();

const defaultString = props.default.toString();

const saveText = ref('💾');

const inputValue = ref(props.modelValue);

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal;
});

function validateNumber(num: unknown): number {
    if (typeof num !== 'number') {
        return props.default;
    }

    if (isNaN(num)) {
        return props.default;
    }

    if (props.min !== undefined && num < props.min) {
        return props.min;
    }

    if (props.max !== undefined && num > props.max) {
        return props.max;
    }

    return num;
}

const updateValue = () => {
    const valueToSave = validateNumber(inputValue.value);
    inputValue.value = valueToSave;

    emit('update:modelValue', inputValue.value);

    saveText.value = '✅';
    setTimeout(() => {
        saveText.value = '💾';
    }, 500);
}
</script>

<template>
    <label class="w-full flex flex-col justify-between items-start">
        <OptionText :label :tooltip />

        <div class="w-full flex flex-row gap-2">
            <input type="number" v-model="inputValue" :placeholder="defaultString" :aria-label="label" :min :max
                @keyup.enter="updateValue" class="w-full border-2 border-border-muted p-2 rounded-lg outline-none focus:border-border" />
            <div class="w-fit p-2 rounded-lg bg-border-muted hover:bg-border cursor-pointer" @click="updateValue">
                {{ saveText }}
            </div>
        </div>
    </label>
</template>
