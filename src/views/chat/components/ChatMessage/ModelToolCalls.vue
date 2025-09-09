<script setup lang="ts">
import { ref } from 'vue';
import { BiWrench } from 'vue-icons-plus/bi';

defineProps<{
	message: ModelChatMessage,
}>();

const showingTools = ref<number[]>([]);

function toggleShowing(index: number) {
	const foundIndex = showingTools.value.indexOf(index);
	if (foundIndex > -1) { 
		showingTools.value.splice(foundIndex, 1);
	} else {
		showingTools.value.push(index);
	}
}

</script>

<template>
	<div v-if="message.toolCalls" class="flex flex-col bg-surface rounded-xl">
		<div 
			class="flex flex-row items-center justify-between pt-4 pl-4">
			<div class="">
				<BiWrench class="inline mr-1 size-4" />
				<span class="font-semibold select-none align-middle">Requested Tools</span>
			</div>
		</div>
		<!-- todo: add transition group -->
		<div v-for="call, index in message.toolCalls" :key="index" class="bg-surface-light m-2 p-2 rounded-lg group" @click="toggleShowing(index)">
			<span class="select-none cursor-pointer group-hover:text-text" :class="{ 'text-text': showingTools.includes(index) }">• {{ call.function.name }}</span>

			<div v-if="showingTools.includes(index)">
				<div v-for="[key, value] in Object.entries(call.function.arguments)">
					{{ key }}: <span class="italic">{{ value }}</span>
				</div>
			</div>
		</div>
	</div>
</template>