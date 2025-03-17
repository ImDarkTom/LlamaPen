<script setup lang="ts">
import DropdownButton from './DropdownButton.vue';

const props = defineProps<{
	direction: 'up' | 'down',
	anchor: 'left' | 'center' | 'right',
	modelValue: boolean
}>();

const emit = defineEmits(['update:modelValue']);

function handleClickOutside() {
    if (props.modelValue) {
        emit('update:modelValue', false);
    }
}

</script>

<template>
	<div v-mousedown-outside="handleClickOutside">
		<div class="relative">
			<DropdownButton 
				:direction="direction" 
				:opened="modelValue"
				@update:opened="emit('update:modelValue', $event)"
			>
				<slot name="button">Dropdown</slot>
			</DropdownButton>

			<div v-if="modelValue" class="absolute bg-primary-300 p-1.5 rounded-lg max-w-dvw w-96 box-border z-20 shadow-md shadow-black/50 transition-shadow duration-100 
                motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[0.10s]"
                :class="{
                    'bottom-full mb-2 motion-translate-y-in-[25%]': $props.direction === 'up',
                    'top-full mt-2 motion-translate-y-in-[-25%]': $props.direction === 'down',
					'left-0 motion-translate-x-in-[-10%]': $props.anchor === 'left',
					'right-0 motion-translate-x-in-[10%]': $props.anchor === 'right',
					'-left-[150%]': $props.anchor === 'center' //todo: temporary, fix later
                }" role="listbox"
			>
				<slot name="content">Dropdown content</slot>
			</div>
		</div>
	</div>
</template>