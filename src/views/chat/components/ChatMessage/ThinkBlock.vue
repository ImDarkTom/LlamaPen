<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { computed, ref } from 'vue';
import { BiBrain, BiChevronDown, BiChevronUp } from 'vue-icons-plus/bi';

const config = useConfigStore();

const props = defineProps<{
	message: ModelChatMessage,
}>();

const opened = ref(config.chat.thinking.infoOpenByDefault);

const thinkBlockText = computed<string | null>(() => {
	const rule = /^<think>([\s\S]*?)(?=<\/think>|$)/i;
	return rule.exec(props.message.content)?.[1].trim() || props.message.thinking || null;
});
</script>

<template>
	<div v-if="thinkBlockText !== null" class="flex flex-col bg-surface *:p-4 rounded-xl mb-4">
		<div 
			class="flex flex-row items-center justify-between cursor-pointer" 
			:class="{ '!pb-0': opened }"
			@click="opened = !opened">
			<div class="flex flex-row items-center gap-2">
				<BiBrain />
				<span class="text-lg font-semibold select-none">Thoughts</span>
			</div>
			<BiChevronUp v-if="opened" />
			<BiChevronDown v-else />
		</div>
		<Transition name="expand-height">
			<div v-if="opened" class="!pt-0">
				<div class="w-full h-[1px] bg-text-muted mt-4 mb-2"></div>
				<div class="whitespace-pre-wrap text-text-muted italic">
					{{ thinkBlockText }}
				</div>
			</div>
		</Transition>
	</div>
</template>