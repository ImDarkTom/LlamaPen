<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import useNotesStore from '@/stores/notesStore';
import { storeToRefs } from 'pinia';
import router from '@/router';
import ModelSelect from '@/components/ModelSelect/ModelSelect.vue';
import { useConfigStore } from '@/stores/config';
import setPageTitle from '@/utils/title';
import ollamaApi from '@/utils/ollama';
import { useUiStore } from '@/stores/uiStore';
import { VscDebugDisconnect } from 'vue-icons-plus/vsc';
import logger from '@/utils/logger';
import HeaderButton from './components/HeaderButton.vue';
import { BiText } from 'vue-icons-plus/bi';

const config = useConfigStore();
const notesStore = useNotesStore();
const uiStore = useUiStore();
const route = useRoute();

const { openedNote } = storeToRefs(notesStore);

const noteEditorElem = ref<HTMLTextAreaElement | null>(null);
const noteTitleElem = ref<HTMLInputElement | null>(null);

const starterPromptElem = ref<HTMLInputElement | null>(null);

onMounted(() => {
	const routeId = route.params.id;

	if (typeof routeId === 'object') {
		console.error('routeId appeared as object, not string', routeId);
		return;
	}

	loadNote(routeId);

	document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
	document.removeEventListener('keydown', handleKeyDown);
});

function handleTitleInputKeyDown(e: KeyboardEvent) {
	if (e.key === 'Enter') {
		save()
		noteEditorElem.value?.focus();
	}
}

function handleKeyDown(e: KeyboardEvent) {
	// TODO: add duplicate note if holding shift
	if (e.key === 's' && e.ctrlKey && openedNote.value) {
		e.preventDefault();
		save();
		return;
	}

	if (e.key === 'O' && e.ctrlKey && e.shiftKey) {
		e.preventDefault();
		router.push('/note');
		return;
	}

	if (e.key === 'Escape' && e.shiftKey) {
		e.preventDefault();
		noteEditorElem.value?.focus();
		return;
	}

	if (e.key === 'Backspace' && e.shiftKey && e.ctrlKey) {
		if (!openedNote.value) return;

		if (confirm(`Are you sure you want to delete "${openedNote.value.title}"?`)) {
			notesStore.deleteNote(openedNote.value.id);
			router.push('/note');
		}
	}

	if (e.key === 'Tab') {
		e.preventDefault();
		generateContinuation();
	}
}

watch(() => route.params.id, (newId) => {
	if (typeof newId === 'object') {
		console.error('newId appeared as object, not string', newId);
		return;
	}

	loadNote(newId);
});

watch(() => openedNote.value, (newValue) => {
	setPageTitle(`${newValue?.title ?? 'Untitled Note'} | Note`)
});

function loadNote(newId?: string) {
	logger.info('Note Page', 'Loading note with ID', newId);

	if (!newId) {
		notesStore.openedNoteId = null;
	} else {
		const parsedId = parseInt(newId);
		notesStore.openedNoteId = parsedId;
	}

	if (config.note.focusOnLoad) {
		noteEditorElem.value?.focus();
	}
}

// Save button
const saveButtonIcon = ref('💾');

async function save() {
	// New note creation is handle inside `saveNote` so we do not need to handle that here.
	const isNewNote = await notesStore.saveNote(noteEditorElem.value!.value, noteTitleElem.value!.value);

	if (isNewNote) {
		router.push(`/note/${notesStore.openedNoteId}`);
	}

	saveButtonIcon.value = '✅';
	setTimeout(() => {
		saveButtonIcon.value = '💾';
	}, 500);
}

async function startFromScratch() {
	await notesStore.saveNote('', 'Untitled');
	router.push(`/note/${notesStore.openedNoteId}`);
}

async function generateStarter() {
	logger.info('Note Page', 'Generating note starter');

	const prompt = starterPromptElem.value?.value;
	if (!prompt || prompt === "") {
		return;
	}

	const abortController = new AbortController();

	await notesStore.saveNote('', prompt);
	const newlyCreatedNoteId = notesStore.openedNoteId;
	router.push(`/note/${newlyCreatedNoteId}`);

	const chatRequest = ollamaApi.chat([
		{
			role: 'user',
			content: prompt
		}
	], abortController.signal);

	for await (const chunk of chatRequest) {
		if ('error' in chunk) {
			alert(chunk.error.message);
			return;
		}

		if ('stream_done' in chunk) {
			logger.info('Note Page', 'Generating note starter finished.')
			save();
			return;
		}

		if (!newlyCreatedNoteId) {
			throw new Error('No opened note when appending message chunk.')
		}

		notesStore.appendToNoteBody(newlyCreatedNoteId, chunk.message.content);
	}
}

let isGeneratingContinuation = ref(false);
const generateContinuationIcon = computed(() => {
	return isGeneratingContinuation.value ? '⏳' : '▶️';
});

const abortController = new AbortController();

async function generateContinuation() {
	if (!openedNote.value) return;

	await save();

	const chatRequest = ollamaApi.chat([
		{
			role: 'system',
			content: 'Continue any writing given yo you by the user.'
		},
		{
			role: 'user',
			content: openedNote.value.content ?? ''
		}
	], abortController.signal);

	isGeneratingContinuation.value = true;
	
	for await (const chunk of chatRequest) {
		if ('error' in chunk) {
			alert(chunk.error.message);
			return;
		}

		if ('stream_done' in chunk) {
			logger.info('Note Page', 'Generating note starter finished.')
			save();
			return;
		}

		notesStore.appendToNoteBody(openedNote.value.id, chunk.message.content);
	}
}

function cancelGenerateContinuation() {
	if (!openedNote.value) return;
	abortController.abort();

	abortController.signal.onabort = () => {
		logger.info('Note Page', 'Generation continuation aborted.');
		isGeneratingContinuation.value = false;
	};
}

function continueGenerationButtonPress() {
	if (!openedNote.value) return;

	if (isGeneratingContinuation.value) {
		cancelGenerateContinuation();
		return;
	}

	generateContinuation();
}

// Header Labels
function toggleLabels() {
	config.note.showHeaderLabels = !config.note.showHeaderLabels;
}
</script>

<template>
	<div class="w-full h-full flex flex-col p-2 box-border gap-2">
		<div class="w-full bg-primary-300 rounded-lg p-2 flex flex-row gap-2"
		:class="{ 'ml-12': !config.showSidebar }">
			<HeaderButton @click="save" label="Save">
				{{ saveButtonIcon }}
			</HeaderButton>	
			<ModelSelect button-classes="!bg-primary-200 !ring-0" direction="down" />
			<HeaderButton @click="continueGenerationButtonPress" label="Continue">
				{{ generateContinuationIcon }}
			</HeaderButton>
			<div class="grow"></div>
			<HeaderButton @click="toggleLabels" label="Toggle Labels">
				<BiText />
			</HeaderButton>
		</div>

		<div class="w-full h-12 box-border bg-primary-300 rounded-lg p-1 flex flex-row gap-2">
			<input type="text" placeholder="Modify..." class="grow bg-primary-400 p-2 rounded-md outline-none">
			<button class="bg-primary-200 p-2 rounded-md cursor-pointer">✏️ Edit</button>
		</div>

		<div v-if="openedNote" class="flex grow bg-primary-500 p-2 rounded-lg justify-center">
			<div class="flex flex-col grow h-full max-w-2xl w-full gap-2">
				<div class="w-full flex flex-col">
					<input ref="noteTitleElem" type="text" class="!text-4xl font-semibold outline-none"
						:value="openedNote.title" @keydown="handleTitleInputKeyDown">
					<i class="text-txt-2 text-sm">Created: {{ openedNote.createdAt.toLocaleString()
					}} - Edited: {{ openedNote.lastEdited.toLocaleString() }}</i>
				</div>
				<textarea ref="noteEditorElem" class="grow !text-base md:!text-lg text-txt-2 outline-none resize-none"
					:value="openedNote.content"></textarea>
			</div>
		</div>
		<div v-else class="flex grow bg-primary-500 rounded-lg items-center justify-center">
			<div class="flex flex-col bg-primary-300 rounded-lg">
				<div v-if="uiStore.connectedToOllama" class="p-4 flex flex-row gap-2 items-center justify-center">
					<span class="text-lg font-bold">Write</span>
					<input ref="starterPromptElem" type="text" class="w-full bg-primary-400 p-2 rounded-md"
						placeholder="a note about..." @keyup.enter="generateStarter">
				</div>
				<div v-else class="p-4 flex flex-row gap-1 items-center justify-center">
					<VscDebugDisconnect /> 
					<span class="text-lg font-semibold">Generation unavailable</span>
				</div>
				<div class="w-full h-[1px] bg-txt-2"></div>
				<div class="p-4 flex justify-center cursor-pointer text-txt-2 font-semibold hover:bg-primary-200 rounded-b-lg transition-colors duration-100"
					@click="startFromScratch">
					Or start from scratch
				</div>
			</div>
		</div>
	</div>
</template>