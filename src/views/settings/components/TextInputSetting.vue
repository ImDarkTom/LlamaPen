<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
	modelValue: string;
	label: string;
	default: string;
	check?: (text: string) => string;
}>();

const saveText = ref('💾');

const inputValue = ref(props.modelValue);

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
	inputValue.value = newVal;
});

const updateValue = () => {
	let valueToSave = inputValue.value;
	
	if (props.check) {
		valueToSave = props.check(valueToSave);
		inputValue.value = valueToSave;
	}
	
	console.log('Saving...', inputValue.value);
	emit('update:modelValue', inputValue.value);

	saveText.value = '✅';
	setTimeout(() => {
		saveText.value = '💾';
	}, 500);
}
</script>

<template>
	<label class="w-full flex flex-col justify-between items-start">
		<span class="text-lg font-medium">{{ label }}</span>
		
		<div class="w-full flex flex-row gap-2">
			<input
				type="text"
				v-model="inputValue"
				:placeholder="default"
				:aria-label="label || 'Text Input'"
				@keyup.enter="updateValue"
				class="w-full bg-primary-200 p-2 rounded-lg"
			/>
			<div class="w-fit p-2 rounded-lg bg-primary-100 cursor-pointer" @click="updateValue">
				{{ saveText }}
			</div>
		</div>
	</label>
</template>
