<script setup lang="ts">
import MessageInputButton from '@/views/chat/components/MessageInput/buttons/MessageInputButton.vue';
import { BsChevronDown, BsChevronUp } from 'vue-icons-plus/bs';

const props = defineProps<{
	direction: 'up' | 'down';
	opened: boolean;
}>();

const emit = defineEmits(['update:opened']);

const toggleOpened = () => {
	emit('update:opened', !props.opened);
}
</script>

<template>
	<MessageInputButton
		class="flex flex-row items-center gap-2 w-max overflow-ellipsis" 
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
	</MessageInputButton>
</template>