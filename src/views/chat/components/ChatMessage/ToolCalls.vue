<script setup lang="ts">
import { onMounted } from 'vue';
import { BiWrench } from 'vue-icons-plus/bi';

defineProps<{
	message: ModelChatMessage,
}>();

onMounted(() => {
	
});

</script>

<template>
	<div v-if="message.toolCalls" class="flex flex-col bg-surface rounded-xl mb-4">
		<div 
			class="flex flex-row items-center justify-between p-4">
			<div class="flex flex-row items-center gap-2">
				<BiWrench />
				<span class="text-lg font-semibold select-none">Tool Calls</span>
			</div>
		</div>
		<!-- todo: add transition group -->
		<div v-for="call in message.toolCalls" class="bg-surface-light m-2 p-2 rounded-lg">
			<span class="text-text text-lg">{{ call.function.name }}</span>
			<div v-for="[key, value] in Object.entries(call.function.arguments)">
				{{ key }}: <span class="italic">{{ value }}</span>
			</div>
		</div>
	</div>
</template>