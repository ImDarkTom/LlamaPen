<script setup lang="ts">
import { usePersonasStore } from '@/stores/personas';
import { computed } from 'vue';

const personasStore = usePersonasStore();

const props = defineProps<{
	personaId: string | null,
}>();

const openedPersona = computed(() => props.personaId ? personasStore.allPersonas.find(p => p.id === props.personaId) || null : null);
</script>

<template>
	<div class="w-full h-full flex items-center justify-center p-3 pl-0">
		<div v-if="!personaId"
			class="flex items-center justify-center w-full h-full text-2xl"
		>
			Select a persona from the list create a new one.
		</div>
		<div class="w-full h-full rounded-lg p-4 bg-primary-400" v-else>
			<div>
				<span class="text-5xl">{{ openedPersona?.icon }}</span>
				<span class="ml-2 text-4xl">{{ openedPersona?.name }}</span>
			</div>
			<div class="flex flex-col gap-2 mt-4">
				<span class="text-xl font-semibold">{{ openedPersona?.brief }}</span>
				
				<div class="flex flex-col gap-1 mt-2">
					<span class="text-lg font-medium">System prompt:</span>
					<span class="text-lg italic">{{ openedPersona?.systemPrompt }}</span>
				</div>
			</div>
		</div>
	</div>
</template>