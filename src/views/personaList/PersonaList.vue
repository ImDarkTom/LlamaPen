<script setup lang="ts">
import { usePersonasStore } from '@/stores/personas';
import PersonaEditor from './components/PersonaEditor.vue';
import { ref } from 'vue';
import PersonaViewer from './components/PersonaViewer.vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

const personasStore = usePersonasStore();
const route = useRoute();

const openedPersonaId = ref<string | null>(route.params.id ? route.params.id as string : null);
const editing = ref<boolean>(false);

onBeforeRouteUpdate((to, from) => {
	if (to.params.id) {
		openedPersonaId.value = to.params.id as string;
	} else {
		openedPersonaId.value = null;
	}
})

</script>

<template>
	<div class="w-full h-full flex flex-row">
		<div class="flex flex-col w-4/12 m-3 box-border overflow-y-auto pt-10 gap-3">
			<div 
				v-for="persona of personasStore.allPersonas" 
				:key="persona.id"

				class="w-full bg-primary-300 rounded-lg p-4 box-border flex flex-row gap-2 items-center cursor-pointer hover:brightness-125"
				@click="$router.push(`/persona/view/${persona.id}`)"
			>
				<span class="text-xl">{{ persona.icon }}</span>
				<span>{{ persona.name }}</span>
			</div>
			<div class="w-full bg-primary-400 rounded-lg p-4 box-border text-center cursor-pointer hover:brightness-110 transition-all duration-100"> 
				<span class="font-semibold text-lg">Create new persona</span>
			</div>
		</div>
		<div class="w-8/12">
			<PersonaEditor v-if="editing" />
			<PersonaViewer :personaId="openedPersonaId" v-else />
		</div>
	</div>
</template>