<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { computed, ref } from 'vue';
import { BiBrain } from 'vue-icons-plus/bi';
import { BsChevronDown, BsChevronUp } from 'vue-icons-plus/bs';

const config = useConfigStore();

const props = defineProps<{
	message: ChatMessage,
}>();

const opened = ref(config.chat.reasoning.info_open_by_default);

const thinkBlockText = computed<string | null>(() => {
	const rule = /^<think>([\s\S]*?)(?=<\/think>|$)/i;
	return rule.exec(props.message.content)?.[1].trim() || null;
});

</script>

<template>
	<div v-if="thinkBlockText !== null" class="flex flex-col bg-primary-200 p-4 rounded-xl mb-4 cursor-pointer"
		@click="opened = !opened">
		<div class="flex flex-row items-center justify-between">
			<div class="flex flex-row items-center gap-2">
				<BiBrain />
				<span class="text-lg font-bold select-none">Thoughts</span>
			</div>
			<div class="cursor-pointer">
				<BsChevronUp v-if="opened" />
				<BsChevronDown v-else />
			</div>
		</div>
		<template v-if="opened">
			<div class="w-full h-[1px] bg-txt-1 mt-4 mb-2"></div>
			<div class="whitespace-pre-wrap text-txt-2 italic">
				{{ thinkBlockText }}
			</div>
		</template>
	</div>
</template>