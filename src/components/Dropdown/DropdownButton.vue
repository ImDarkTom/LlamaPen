<script setup lang="ts">
import MessageInputButton from '@/views/chat/components/MessageInput/buttons/MessageInputButton.vue';
import { BiChevronDown, BiChevronUp } from 'vue-icons-plus/bi';

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
		class="flex flex-row items-center gap-1 w-max overflow-ellipsis" 
		@click="toggleOpened" 
		aria-haspopup="listbox"
		:aria-expanded="opened"
	>
		<slot></slot>

		<template v-if="$props.direction === 'up'">
			<BiChevronUp v-if="opened"  />
			<BiChevronDown v-else  />
		</template>
		<template v-else>
			<BiChevronDown v-if="opened" />
			<BiChevronUp v-else />
		</template>
	</MessageInputButton>
</template>