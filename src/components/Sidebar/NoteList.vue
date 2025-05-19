<script lang="ts" setup>
import { computed } from 'vue';
import SidebarEntryTextpad from './SidebarEntryTextpad.vue';
import useNotesStore from '@/stores/notesStore';

const notesStore = useNotesStore();

const pinnedNotes = computed<Note[]>(() => {
    return notesStore.notes.filter((note) => (note.pinned || false)).sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime());
});

const hasPinnedNotes = computed<boolean>(() => {
    return pinnedNotes.value.length !== 0;
});

const unpinnedNotes = computed<Note[]>(() => {
    return notesStore.notes.filter((note) => !(note.pinned || false)).sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime());
});
</script>

<template>
	<div class="p-0 m-0 flex-1 overflow-y-auto">
		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="pinnedNotesSection">
			<h3 id="pinnedNotesSection" class="sr-only">Pinned Notes</h3>
			<SidebarEntryTextpad v-for="note of pinnedNotes" :key="note.id" :note="note" />
		</div>

		<div v-if="hasPinnedNotes" class="w-full h-[1px] bg-txt-1/50" role="separator"></div>

		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="unpinnedNotesSection">
			<h3 id="unpinnedNotesSection" class="sr-only">Unpinned Notes</h3>
			<SidebarEntryTextpad v-for="note of unpinnedNotes" :key="note.id" :note="note" />
		</div>
	</div>
</template>