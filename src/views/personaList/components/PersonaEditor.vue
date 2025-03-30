<script setup lang="ts">
import { usePersonasStore } from '@/stores/personas';
import { v4 as generateUUID } from 'uuid';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const personasStore = usePersonasStore();
const route = useRoute();
const router = useRouter();

const editing = route.params.id ? true : false;

const persona = ref<EditedPersona>({
	id: (route.params.id ?? generateUUID()) as string,
	icon: '🤖',
	name: '',
	brief: '',
	systemPrompt: '',
	updated: new Date().getTime(),
});

onMounted(() => {
	if (editing) {
		const openedPersona = personasStore.allPersonas.find(p => p.id === route.params.id);

		if (!openedPersona) {
			alert('Persona not found.');
			return;
		}

		persona.value = openedPersona;	
	}
})

function savePersona() {
	personasStore.savePersona(persona.value);
	
	router.push('/persona/list')
}
</script>

<template>
	<div class="w-full h-full flex items-center py-4 box-border overflow-y-auto px-2">
		<div class="flex flex-col mx-auto md:w-3/5 lg:w-1/2 bg-primary-400 rounded-xl p-4 gap-4">
			<div class="flex flex-row items-center gap-2">
				<input type="text" v-model="persona.icon" placeholder="🤖" class="w-12 leading-1.5 p-2 border-none outline-none ring-1 ring-txt-2 rounded-lg " />
				<input type="text" v-model="persona.name" placeholder="Custom persona" class="leading-1.5 w-full p-2 border-none outline-none ring-1 ring-txt-2 rounded-lg" />
			</div>
			<input type="text" v-model="persona.brief" placeholder="A persona that can..." class="leading-1.5 w-full p-2 border-none outline-none ring-1 ring-txt-2 rounded-lg" />
			<textarea v-model="persona.systemPrompt" class="w-full p-2 border-none outline-none ring-1 ring-txt-2 rounded-lg resize-y" placeholder="You are Custom persona, you should..."></textarea>
			<input 
				type="button" 
				class="bg-txt-2 text-primary-300 w-full rounded-lg p-2 font-semibold text-xl cursor-pointer hover:opacity-70" 
				:value="editing ? 'Save' : 'Create'" 
				@click="savePersona"
			>
		</div>
	</div>
</template>