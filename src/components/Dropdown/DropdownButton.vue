<script setup lang="ts">
import { BsChevronDown, BsChevronUp } from 'vue-icons-plus/bs';

const props = defineProps<{
	direction: 'up' | 'down';
	opened: boolean;
	additionalClasses?: string,
}>();

const emit = defineEmits(['update:opened']);

const toggleOpened = () => {
	emit('update:opened', !props.opened);
}

</script>

<template>
	<div class="bg-primary-300 hover:bg-primary-400 cursor-pointer p-2 box-border rounded-lg flex flex-row items-center gap-2 text-txt-1 hover:text-txt-2 transition-colors duration-150 select-none ring-1 ring-txt-1/25
		w-max overflow-ellipsis"
		:class="additionalClasses"
		@click="toggleOpened" 
		aria-haspopup="listbox" 
		:aria-expanded="opened"
	>
		<slot></slot>

		<template v-if="$props.direction === 'up'">
			<BsChevronUp v-if="opened" class="w-4 h-full" />
			<BsChevronDown v-else class="w-4 h-full" />
		</template>
		<template v-else>
			<BsChevronDown v-if="opened" class="w-4 h-full" />
			<BsChevronUp v-else class="w-4 h-full" />
		</template>
	</div>
</template>