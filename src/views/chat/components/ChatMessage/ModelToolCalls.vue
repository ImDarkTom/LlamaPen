<script setup lang="ts">
import { ref } from 'vue';
import { BiWrench } from 'vue-icons-plus/bi';

defineProps<{
	message: ModelChatMessage,
}>();

const showing = ref(false);
</script>

<template>
	<div v-if="message.toolCalls" class="flex flex-col bg-surface rounded-xl">
		<div 
			class="p-4 flex flex-row gap-2 items-center text-lg font-semibold select-none cursor-pointer" 
			@click="showing = !showing">
			<BiWrench />
			<span>
				{{ message.toolCalls.length }} tool call(s)
			</span>
		</div>
		<div v-if="showing">
			<div v-for="call, index in message.toolCalls" :key="index" class="bg-surface-light m-2 p-2 mt-0 rounded-lg group cursor-pointer">
				<span class="select-none">
					{{ call.function.name }}
				</span>
				
				<div>
					<div v-for="[key, value] in Object.entries(call.function.arguments)" class="text-sm pt-1">
						{{ key }}: <span class="italic">{{ value }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>