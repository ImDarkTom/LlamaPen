<script setup lang="ts">
const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
	modelValue: boolean;
	label: string;
}>();

const updateValue = () => {
	emit('update:modelValue', !props.modelValue);
}
</script>

<template>
	<label class="w-full flex flex-row justify-between items-center cursor-pointer hover:bg-primary-500/50 transition-colors duration-150" @click="updateValue">
		<span class="text-xl font-medium">{{ label }}</span>
		
		<input 
			class="sr-only"
			type="checkbox"
			:checked="modelValue"
			@change="updateValue"
			:aria-label="label || 'Toggle'"
		/>

		<div
			class="w-12 h-6 flex items-center bg-gray-500 rounded-full p-0.5 transition-all duration-150"
			:class="{ 'bg-primary-200': modelValue }"
			role="switch"
			:aria-checked="modelValue"
			tabindex="0"
			@keydown.space.prevent="updateValue"
		>
			<div
				class="size-5 bg-white rounded-full transition-transform duration-300"
				:class="{ 'translate-x-6': modelValue }"
			></div>
		</div>

	</label>
</template>