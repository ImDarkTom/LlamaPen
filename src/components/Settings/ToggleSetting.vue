<script setup lang="ts">
const emit = defineEmits(['update:modelValue']);

defineProps<{
	modelValue: boolean;
	label: String;
}>();

const updateValue = (event: Event) => {
	emit('update:modelValue', (event.target as HTMLInputElement).checked);
}
</script>

<template>
	<label class="text-xl font-medium pt-4">
		<input 
			class="size-6"
			type="checkbox"
			:checked="modelValue"
			@change="updateValue"
		/>
		{{ label }}
	</label>
</template>