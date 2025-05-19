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

const config = useConfigStore();
const notesStore = useNotesStore();
const route = useRoute();

const { openedNote } = storeToRefs(notesStore);

const noteEditorElem = ref<HTMLTextAreaElement | null>(null);
const noteTitleElem = ref<HTMLInputElement | null>(null);

const starterPromptElem = ref<HTMLInputElement | null>(null);

const generating = ref(false);

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

function handleKeyDown(e: KeyboardEvent) {
	if (e.key === 's' && e.ctrlKey && openedNote.value) {
		e.preventDefault();
		save();
		return;
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

	if (config.textpad.focusOnLoad) {
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
		router.push(`/textpad/${notesStore.openedNoteId}`);
	}

	saveButtonIcon.value = '✅';
	setTimeout(() => {
		saveButtonIcon.value = '💾';
	}, 500);
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
	router.push(`/textpad/${newlyCreatedNoteId}`);

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

		notesStore.appendToNoteBody(newlyCreatedNoteId, chunk.message.content)
	}
}
</script>

<template>
	<div class="w-full h-full flex flex-col p-2 box-border gap-2">
		<div class="w-full bg-primary-300 rounded-lg p-2 flex flex-row gap-2">
			<button class="w-fit p-2 rounded-lg bg-primary-200 cursor-pointer" @click="save">
				{{ saveButtonIcon }}
			</button>
			<ModelSelect button-classes="!bg-primary-200" direction="down" />
		</div>
		<div v-if="openedNote" class="flex grow bg-primary-500 p-2 rounded-lg justify-center">
			<div class="flex flex-col grow h-full max-w-2xl gap-2">
				<div class="w-full flex flex-col">
					<input ref="noteTitleElem" type="text" class="!text-4xl font-semibold outline-none" :value="openedNote?.title ?? 'Untitled'">
					<i v-if="openedNote" class="text-txt-2 text-sm">Created: {{ openedNote?.createdAt.toLocaleString() }} - Edited: {{ openedNote?.lastEdited.toLocaleString() }}</i>
				</div>
				<textarea ref="noteEditorElem" class="grow !text-lg text-txt-2 outline-none resize-none" :value="openedNote?.content"></textarea>
			</div>
		</div>
		<div v-else class="flex grow bg-primary-300 rounded-lg items-center justify-center">
			<div class="relative">
				<div class="absolute top-0 left-0 -translate-1/2 w-64 h-32 rounded-lg"
					:class="{ 'ring-2 ring-txt-2 animate-pulse': generating }"></div>
				<div class="absolute top-0 left-0 -translate-1/2 bg-primary-200 w-64 h-32 p-4 rounded-lg">
					<span class="text-lg">Write...</span>
					<input ref="starterPromptElem" type="text" class="w-full bg-primary-400 p-2 rounded-md" placeholder="about the key themes in..." @keyup.enter="generateStarter">
				</div>
			</div>
		</div>
	</div>
</template>