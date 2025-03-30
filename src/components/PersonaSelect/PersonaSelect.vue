<script setup lang="ts">
import { ref } from 'vue';
import Dropdown from '../Dropdown/Dropdown.vue';
import { BsPersonFill } from 'vue-icons-plus/bs';
import { usePersonasStore } from '@/stores/personas';

const personasStore = usePersonasStore();

const opened = ref<boolean>(false);
const personaList = ref<Persona[]>(personasStore.allPersonas);
const selectedPersona = ref<Persona | null>(personasStore.selectedPersona);

function personaButtonPressed(persona: Persona | null) {
	personasStore.selectPersona(persona);
	opened.value = false;
}

</script>

<template>
	<Dropdown direction="up" anchor="center" v-model="opened">
		<template #button>
			<BsPersonFill />
			<span :class="selectedPersona?.name ? 'italic' : ''">
				{{ selectedPersona?.name || 'Persona' }}
			</span>
		</template>
		<template #content>
			<div>
				<div class="flex flex-row justify-between items-center p-2">
					<span class="font-bold text-xl">My Personas</span>
					<RouterLink to="/persona/list"
						class="text-txt-2 text-lg">Edit</RouterLink>
				</div>
				<div class="flex flex-col gap-1 max-h-96 overflow-y-auto">
					<div class="bg-primary-400 hover:bg-primary-200 transition-colors duration-100 rounded-lg cursor-pointer min-h-14 p-1 flex items-center justify-center font-semibold"
						@click="personaButtonPressed(null)"
					>
						Default/None
					</div>
					<div
						v-for="persona of personaList" 
						:key="persona.id"
						class="flex flex-row gap-2 items-center p-1 hover:bg-primary-200 rounded-lg cursor-pointer min-h-14 transition-colors duration-100"
						@click="personaButtonPressed(persona)"
					>
						<div class="w-4/12 h-13 bg-primary-400 rounded-lg flex flex-row items-center">
							<span class="text-xl p-1">{{ persona.icon }}</span>
							<span class="font-semibold">{{ persona.name }}</span>
						</div>
						<span class="w-8/12 p-0.5 text-txt-2 line-clamp-2" :title="persona.brief">{{ persona.brief }}</span>
					</div>
					<div class="bg-primary-400 hover:bg-primary-200 transition-colors duration-100 rounded-lg cursor-pointer min-h-14 p-1 flex items-center justify-center font-semibold">
						Create/Import persona
					</div>
				</div>
			</div>
		</template>
	</Dropdown>
</template>