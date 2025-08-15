<script setup lang="ts">
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { ref } from 'vue';
import { BiHelpCircle } from 'vue-icons-plus/bi';

const props = defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    label: string;
    tooltip?: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [ newValue: number ]
}>();

const inputId = ref(`message-option-${props.label.toLowerCase().replace(/\s+/g, '-')}`);

function onInput(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    const clampedValue = Math.min(Math.max(value, props.min ?? 0), props.max ?? 100);

    emit('update:modelValue', clampedValue);
}
</script>

<template>
    <div class="flex flex-col py-1">
        <div class="flex flex-row gap-2 items-center">
            <label :for="inputId" class="font-semibold">
                {{ label }} 
            </label>
            <Tooltip v-if="tooltip" :text="tooltip">
                <BiHelpCircle />
            </Tooltip>
        </div>
        <div class="bg-surface-light p-1 flex flex-row gap-2 rounded-md">
            <div class="flex flex-row w-2/3 gap-2 items-center p-1">
                <span>{{ min }}</span>
                <input class="slider appearance-none grow cursor-pointer" type="range" :value="modelValue" @input="onInput" :min :max :step />
                <span>{{ max }}</span>
            </div>

            <input class="p-1 w-1/3 focus:border-border border-border-muted border-2 outline-none rounded-md" :id="inputId" type="number" :value="modelValue" @input="onInput" :min :max :step />
        </div>
    </div>
</template>