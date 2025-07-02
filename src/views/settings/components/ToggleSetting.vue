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
	<label class="w-full flex flex-row justify-between items-center cursor-pointer transition-all duration-dynamic" @click="updateValue">
		<span class="text-lg text-text-muted hover:text-text">{{ label }}</span>
		
		<input 
			class="sr-only"
			type="checkbox"
			:checked="modelValue"
			@change="updateValue"
			:aria-label="label || 'Toggle'"
		/>

		<div
			class="w-12 h-6 flex items-center bg-background-dark rounded-full p-0.5 transition-all duration-dynamic"
			:class="{ 'bg-primary': modelValue }"
			role="switch"
			:aria-checked="modelValue"
			tabindex="0"
			@keydown.space.prevent="updateValue"
		>
			<div
				class="size-5 bg-text rounded-full transition-transform duration-dynamic"
				:class="{ 'translate-x-6': modelValue }"
			></div>
		</div>

	</label>
</template>