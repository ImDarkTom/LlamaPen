import db from '@/utils/db';
import logger from '@/utils/logger';
import { liveQuery } from 'dexie';
import { defineStore } from 'pinia';
import { ref, watch, type Ref } from 'vue';

let liveSyncInitialised = false;

function initLiveSync(
	notes: Ref<Note[]>,
	openedNote: Ref<Note | null>,
	openedNoteId: Ref<number | null>
) {
	if (liveSyncInitialised) return;

	liveSyncInitialised = true;

	liveQuery(() => db.notes.toArray()).subscribe({
		next: data => {
			notes.value = data;
		},
		error: (e) => {
			console.error('Error during liveQuery for notes', e)
		}
	});

	let openedNoteSubscription: { unsubscribe: () => void } | null = null;

	watch(openedNoteId, (newId) => {
		logger.info('Notes Store', 'New openedNoteId value', openedNoteId.value, ' to new id', newId);

		if (openedNoteSubscription) {
			openedNoteSubscription.unsubscribe();
			openedNoteSubscription = null;
		}

		if (newId === null) {
			openedNote.value = null;
			return;
		}

		liveQuery(() => db.notes.where('id').equals(newId).first())
			.subscribe({
				next: data => {
					openedNote.value = data ?? null;
				},
				
			error: (e) => {
				console.error('Error during liveQuery for opened note', e)
			}
		});
	});

	logger.info('Messages Store', 'Initialized live sync for notes store.');
}

const useNotesStore = defineStore('notes', () => {
	const notes = ref<Note[]>([]);
	const openedNote = ref<Note | null>(null);

	const openedNoteId = ref<number | null>(null);

	initLiveSync(notes, openedNote, openedNoteId);

	async function createNewNote(): Promise<number> {
		const newNoteId = await db.notes.add({
			title: 'New Note',
			pinned: 0,
			createdAt: new Date(),
			lastEdited: new Date(),
			content: ''
		});

		return newNoteId;
	}

	async function saveNote(content: string, title: string): Promise<boolean> {
		logger.info('Notes Store', 'Saving note with openedNoteId: ', openedNoteId.value);

		let noteId = openedNoteId.value;
		let isNewNote = false;

		if (noteId === null) {
			logger.info('Notes Store', 'No opened note found, creating new...');

			noteId = await createNewNote();
			openedNoteId.value = noteId;
			isNewNote = true;

			logger.info('Notes Store', `Created new note with ID ${noteId}`);
		}

		await db.notes.update(noteId, {
			content,
			title,
			lastEdited: new Date()
		});

		return isNewNote;
	}

	async function deleteNote(id: number) {
		await db.notes.delete(id);
	}

	async function editNoteName(id: number, newName: string) {
		await db.notes.update(id, {
			title: newName
		});
	}

	async function writeToNote(id: number, noteData: Note) {
		await db.notes.update(id, noteData);
	}

	async function appendToNoteBody(id: number, textToAppend: string) {
		// logger.info('Notes Store', 'Appending text to note body with note id', id);

		await db.notes.where('id').equals(id).modify(item => {
			item.content += textToAppend;
		});
	}

	watch(openedNoteId, (val, oldVal) => {
		console.log(`openedNoteId changed from ${oldVal} to ${val}`);
	});

	return { 
		notes,
		openedNote,
		openedNoteId,
		saveNote,
		deleteNote,
		editNoteName,
		writeToNote,
		appendToNoteBody
	};
});

export default useNotesStore;