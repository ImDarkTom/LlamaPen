<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
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

function handleTitleInputKeyDown() {
	save()
	noteEditorElem.value?.focus();
}

function handleKeyDown(e: KeyboardEvent) {
	if (e.key === 's' && e.ctrlKey && openedNote.value) {
		e.preventDefault();
		save();
		return;
	}

	console.log(e);

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
	console.log('loading note with id', newId);

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
		console.log(openedNote.value);
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
	console.log('generating note starter.');

	const prompt = starterPromptElem.value?.value;

	console.log(prompt);

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
			console.log('done');
			save();
			return;
		}

		if (!newlyCreatedNoteId) {
			throw new Error('No opened note when appending message chunk.')
		}

		console.log(newlyCreatedNoteId, openedNote.value?.id);

		notesStore.appendToNoteBody(newlyCreatedNoteId, chunk.message.content);

		console.log(newlyCreatedNoteId, openedNote.value?.id);
	}
}
</script>

<template>
	<div class="w-full h-full flex flex-col p-2 box-border gap-2">
		<div class="w-full bg-primary-300 rounded-lg p-2 flex flex-row gap-2"
			:class="{ 'ml-12': !config.showSidebar }">
			<button class="w-fit p-2 rounded-lg bg-primary-200 cursor-pointer" @click="save">
				{{ saveButtonIcon }}
			</button>
			<ModelSelect button-classes="!bg-primary-200" direction="down" />
		</div>
		<div v-if="openedNote" class="flex grow bg-primary-500 p-2 rounded-lg justify-center">
			<div class="flex flex-col grow h-full max-w-2xl gap-2">
				<div class="w-full flex flex-col">
					<input ref="noteTitleElem" type="text" class="!text-4xl font-semibold outline-none"
						:value="openedNote.title" @keydown="handleTitleInputKeyDown">
					<i class="text-txt-2 text-sm">Created: {{ openedNote.createdAt.toLocaleString()
						}} - Edited: {{ openedNote.lastEdited.toLocaleString() }}</i>
				</div>
				<textarea ref="noteEditorElem" class="grow !text-lg text-txt-2 outline-none resize-none"
					:value="openedNote.content"></textarea>
			</div>
		</div>
		<div v-else class="flex grow bg-primary-500 rounded-lg items-center justify-center">
			<div class="flex flex-col bg-primary-300 rounded-lg">
				<div v-if="uiStore.connectedToOllama" class="p-4 flex flex-row gap-1 items-center justify-center">
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