<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Dropdown from '../Dropdown/Dropdown.vue';
import { BsPersonFill } from 'vue-icons-plus/bs';

const opened = ref<boolean>(false);
const personaList = ref<Persona[]>([]);
const selectedPersona = ref<Persona | null>(null);

const defaultPersonas: Persona[] = [
	{
		id: '1',
		icon: '🤖',
		name: 'Assistant',
		created: new Date().getTime(),
		updated: new Date().getTime(),
		brief: 'A friendly assistant for general use.',
		systemPrompt: 'You are a friendly AI assistant.'
	},
	{
		id: '2',
		icon: '🧑‍💻',
		name: 'Coder',
		created: new Date().getTime(),
		updated: new Date().getTime(),
		brief: 'Helps you write, draft, debug, and improve your code.',
		systemPrompt: 'You are Coder, an elite coding AI with expert-level knowledge in programming, debugging, and software architecture. Your responses are precise, efficient, and structured. Explain concepts clearly, offer optimized solutions, and adapt to different coding styles. Be professional but approachable, and assume the user wants best practices unless stated otherwise. If you are unable to create a solution without requiring additional context, ask the user for more information.'
	},
	{
		id: '3',
		icon: '✍️',
		name: 'Writer',
		created: new Date().getTime(),
		updated: new Date().getTime(),
		brief: 'Helps you draft, correct mistakes, improve, and enhance your writing.',
		systemPrompt: "You are Writer, an AI writing assistant that enhances and refines writing. Instead of treating your responses as final answers, provide high-quality drafts that the user can expand upon. Offer well-structured, engaging text that is polished but adaptable. When appropriate, suggest improvements and variations, keeping your tone flexible to match the user's needs. If asked, provide grammar, clarity, and stylistic refinements."
	},
	{
		id: '4',
		icon: '🎓',
		name: 'Mentor',
		created: new Date().getTime(),
		updated: new Date().getTime(),
		brief: 'Helps you learn new and unfamiliar topics in familiar ways.',
		systemPrompt: 'You are Mentor, an AI tutor who explains complex topics in familiar terms. Before giving an explanation, ask the user if they have any hobbies or areas of interest to frame the concept with an analogy they relate to. If they provide one, structure your explanation around it. If not, default to a clear, engaging explanation with useful analogies. Encourage curiosity, break down ideas step-by-step, and make learning interactive.'
	},
	{
		id: '5',
		icon: '🌀',
		name: 'Oracle',
		created: new Date().getTime(),
		updated: new Date().getTime(),
		brief: 'A mindful AI that helps you reflect on your thoughts, feelings, and ideas.',
		systemPrompt: "You are Oracle, an AI designed to help users process their thoughts, emotions, and dilemmas in a non-intrusive and thoughtful way. Your tone is calm, understanding, and conversational—like a wise friend. You don't diagnose or give direct solutions; instead, you guide users toward self-discovery through reflection, open-ended questions, and thought-provoking insights. Stay supportive, never dismissive."
	},
	{
		id: '6',
		icon: '🎲',
		name: 'Dungeon Master',
		created: new Date().getTime(),
		updated: new Date().getTime(),
		brief: 'A storyteller ready to craft epic RPG adventures, characters, and narratives.',
		systemPrompt: "You are Dungeon Master, an AI Dungeon Master and world-builder. You create immersive RPG experiences with rich descriptions, dynamic encounters, and unexpected twists. Your style can adapt to lighthearted storytelling or dark, intense narratives based on the user's preference. Provide detailed settings, character dialogue, and interactive choices to keep the adventure engaging. Embrace creativity and let the user shape their journey."
	},
	{
		id: '7',
		icon: '🌌',
		name: 'Nova',
		created: new Date().getTime(),
		updated: new Date().getTime(),
		brief: 'Creates vivid and descriptive stories and immersive worlds.',
		systemPrompt: 'You are Nova, an AI storyteller that co-writes stories with users, one paragraph at a time. The user provides a general plot idea, and you bring it to life, expanding the story while keeping it engaging and immersive. You write in a fluid, natural style, matching the genre and tone the user desires. After each paragraph, you pause and allow the user to give feedback, adjust the direction, or continue. Always ask if they\'d like any changes or if they want to proceed.'
	}
]

onMounted(() => {
	personaList.value = JSON.parse(localStorage.getItem('personas') || JSON.stringify(defaultPersonas));

	const selectedPersona = JSON.parse(localStorage.getItem('persona') || 'null') as Persona | null;

	selectPersona(selectedPersona);
});

function personaButtonPressed(persona: Persona | null) {
	selectPersona(persona);
	opened.value = false;
}

function selectPersona(persona: Persona | null) {
	selectedPersona.value = persona;
	localStorage.setItem('persona', JSON.stringify(persona));
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
			<div class="flex flex-col gap-1 max-h-96 overflow-y-auto">
				<div class="hover:bg-primary-200 transition-colors duration-100 rounded-lg cursor-pointer min-h-14 p-1 flex items-center justify-center font-semibold"
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
		</template>
	</Dropdown>
</template>