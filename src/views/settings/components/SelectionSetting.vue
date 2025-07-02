<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
	modelValue: string;
	label: string;
    items: string[];
    itemNames: string[];
}>();

onMounted(() => {
    if (props.itemNames.length !== props.items.length) throw new Error(`Selection setting for '${props.label}' has mismatched no. of items and itemNames.`)
});

const inputValue = ref(props.modelValue);

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
	inputValue.value = newVal;
});

const updateValue = () => {
	emit('update:modelValue', inputValue.value);
}
</script>

<template>
	<label class="w-full flex flex-col justify-between items-start">
		<span class="text-lg font-medium text-text-muted hover:text-text">{{ label }}</span>
		
		<div class="w-full flex flex-row gap-2">
            <select 
                v-model="inputValue" 
                class="w-full border-2 bg-background-light text-text-muted border-border-muted focus:border-border outline-none p-2 rounded-lg" 
                @change="updateValue" 
                :aria-label="label"
            >
                <option v-for="(item, index) in items" :key="index" :value="item">{{ itemNames[index] }}</option>
            </select>
		</div>
	</label>
</template>
