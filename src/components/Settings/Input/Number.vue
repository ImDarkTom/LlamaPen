<script setup lang="ts">
import { ref, watch } from 'vue';
import { BiCheck, BiSave } from 'vue-icons-plus/bi';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
    modelValue: number;
    label: string;
    default: number;
    min?: number;
    max?: number;
    tooltip: string;
}>();

const defaultString = props.default.toString();

const showSaveSuccess = ref(false);

const inputValue = ref(props.modelValue);

// Watch for external modelValue changes
watch(
    () => props.modelValue,
    (newVal) => {
        inputValue.value = newVal;
    },
);

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

    showSaveSuccess.value = true;
    setTimeout(() => {
        showSaveSuccess.value = false;
    }, 1000);
};

const inputId = useId();
</script>

<template>
    <div class="min-w-full flex flex-row justify-between items-center">
        <SettingsOptionText
            :label
            :for="inputId"
            :tooltip />

        <div class="min-w-56 flex flex-row gap-2">
            <input
                type="number"
                v-model="inputValue"
                :id="inputId"
                :placeholder="defaultString"
                :aria-label="label"
                :min
                :max
                @keyup.enter="updateValue"
                class="w-full p-2 rounded-lg bg-base-700 hover:bg-base-600 outline-base-500 outline-0 focus:outline-2 transition-all duration-dynamic text-sm! font-medium" />
            <div
                class="w-fit p-2 rounded-lg text-center aspect-square bg-base-600 hover:bg-base-500 text-base-300 hover:text-base-200 cursor-pointer"
                @click="updateValue">
                <component
                    :is="showSaveSuccess ? BiCheck : BiSave"
                    class="size-5" />
            </div>
        </div>
    </div>
</template>
