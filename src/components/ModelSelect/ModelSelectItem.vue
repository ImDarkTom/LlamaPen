<script setup lang="ts">
import { AiOutlineArrowRight } from 'vue-icons-plus/ai';

defineProps<{
	model: ModelListItem,
	index: number,
	focusedItemIndex: number,
	queriedModelList: ModelList,
}>();

defineEmits<{
	(e: 'setModel', name: string): void,
}>();

</script>

<template>
	<li class="relative group flex flex-col cursor-pointer p-3 hover:bg-primary-400 transition-colors duration-75 rounded-lg overflow-x-hidden"
	    :class="{ 'bg-primary-500 shadow-sm shadow-black/50': index === focusedItemIndex }"
	    @click="$emit('setModel', model.model)" ref="listItemsRef" :aria-selected="index === focusedItemIndex">
	    <span
	        class="w-full text-md font-semibold text-ellipsis whitespace-nowrap overflow-hiddefont-bold"
	        :title="model.name">{{ model.name }}</span>
	    <span class="text-sm text-txt-2 ">{{ model.details.parameter_size }}</span>
	    <div class="absolute hidden items-center justify-center right-0 top-0 h-full w-16 bg-gradient-to-r from-transparent to-primary-400 group-hover:flex transition-colors duration-75"
	        :class="{ '!flex not-group-hover:!to-primary-500': index === focusedItemIndex, 'text-txt-2 group-hover:text-txt-1': index === focusedItemIndex }">
	        <AiOutlineArrowRight class="size-8 " />
	    </div>
	</li>
</template>