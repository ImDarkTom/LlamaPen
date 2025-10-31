<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { computed, ref } from 'vue';
import { BiBrain, BiCheck, BiChevronDown, BiChevronUp, BiLoaderAlt } from 'vue-icons-plus/bi';

const config = useConfigStore();

const props = defineProps<{
	message: ModelChatMessage,
	messageState: MessageGenerationState,
}>();

const opened = ref(config.chat.thinking.infoOpenByDefault);

const thinkBlockText = computed<string | null>(() => {
	const rule = /^<think>([\s\S]*?)(?=<\/think>|$)/i;
	return rule.exec(props.message.content)?.[1].trim() || props.message.thinking || null;
});

const thinkStats = computed<{ ended: boolean, time: string } | null>(() => {
	const started = props.message.thinkStats?.started;
	if (!props.message.thinkStats || !started || started === -1) return null;

	const ended = (!props.message.thinkStats.ended || props.message.thinkStats.ended !== -1) ? props.message.thinkStats.ended! : Date.now();

	return { time: ((ended - started) / 1000).toFixed(2), ended: props.message.thinkStats.ended !== -1 };
});

const thinkingOngoing = computed(() => {
	return props.messageState.generating && (thinkStats.value && !thinkStats.value.ended);
});
</script>

<template>
	<div v-if="thinkBlockText !== null" class="flex flex-col bg-surface *:p-4 rounded-xl mb-4">
		<div 
			class="flex flex-row items-center justify-between cursor-pointer" 
			:class="{ '!pb-0': opened }"
			@click="opened = !opened">
			<div class="flex flex-row items-center gap-2" :class="{ 'animate-blink': thinkingOngoing }">
				<BiBrain />
				<span class="text-lg font-semibold select-none">{{ thinkingOngoing ? 'Thinking...' : 'Thoughts' }}</span>
			</div>
			<div class="flex flex-row gap-2">
				<span v-if="thinkStats">
					<span class="items-center">{{ thinkStats.time }}s</span>
					<BiLoaderAlt v-if="thinkingOngoing" class="inline size-4 ml-2 animate-spin" />
					<BiCheck v-else class="inline size-4 ml-1" />
				</span>
				<BiChevronUp v-if="opened" />
				<BiChevronDown v-else />
			</div>
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