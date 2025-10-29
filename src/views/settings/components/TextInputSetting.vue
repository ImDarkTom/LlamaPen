<script setup lang="ts">
import { ref, watch } from 'vue';
import OptionText from './OptionText.vue';
import { BiCheck, BiSave } from 'vue-icons-plus/bi';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
	modelValue: string;
	label: string;
	default: string;
	check?: (text: string) => string;
	tooltip?: string;
}>();

const showSaveSuccess = ref(false);

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
	
	emit('update:modelValue', inputValue.value);

	showSaveSuccess.value = true;
	setTimeout(() => {
		showSaveSuccess.value = false;
	}, 1000);
}
</script>

<template>
	<label class="w-full flex flex-col justify-between items-start">
		<OptionText :label :tooltip />
		
		<div class="w-full flex flex-row gap-2">
			<input
				type="text"
				v-model="inputValue"
				:placeholder="default"
				:aria-label="label || 'Text Input'"
				@keyup.enter="updateValue"
				class="w-full p-2 rounded-lg ring-1 ring-border hover:ring-highlight outline-highlight outline-0 focus:outline-2 transition-all duration-dynamic"
			/>
			<div class="w-fit p-2 rounded-lg text-center aspect-square bg-primary hover:bg-highlight text-surface cursor-pointer" @click="updateValue">
                <component :is="showSaveSuccess ? BiCheck : BiSave" />
            </div>
		</div>
	</label>
</template>
