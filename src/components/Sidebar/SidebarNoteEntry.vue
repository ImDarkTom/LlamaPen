<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PiNotepad } from 'vue-icons-plus/pi';
import useNotesStore from '@/stores/notesStore';
import SidebarEntry from './SidebarEntry.vue';
import { getDateTimeString } from '@/utils/core/getDateTimeString';

const notesStore = useNotesStore();
const router = useRouter();

const editing = ref<boolean>(false);

const entryRef = ref<InstanceType<typeof SidebarEntry> | null>(null);
const entryTextRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
    entryTextRef.value = entryRef.value?.entryTextRef || null;
});

const props = defineProps<{
    note: Note,
}>();

function deleteNote(e: MouseEvent) {
    e.preventDefault();

    if (confirm(`Are you sure you want to delete "${props.note.title}"?`)) {
        notesStore.deleteNote(props.note.id);
        router.push('/note');
    }
}

function editNoteName(e: MouseEvent) {
    e.preventDefault();
    const noteNameElem = entryTextRef.value;

    if (!noteNameElem) {
        return;
    }

    noteNameElem.setAttribute('data-originaltext', noteNameElem.value);
    noteNameElem.removeAttribute('readonly');
    noteNameElem.focus();
    noteNameElem.select();
    noteNameElem.setSelectionRange(0, 999);
    editing.value = true;
}

function stopEditing(save = true) {
    const noteNameElem = entryTextRef.value;

    if (!noteNameElem) {
        return;
    }

    noteNameElem.setAttribute('readonly', '');
    editing.value = false;

    if (!save) {
        noteNameElem.value = noteNameElem.getAttribute('data-originaltext') || "Unnamed chat";
        noteNameElem.removeAttribute('data-originaltext');
        return;
    }

    notesStore.editNoteName(props.note.id, noteNameElem.value);
}

const hoverTitle = `${props.note.title}
Last edited: ${getDateTimeString(props.note.lastEdited)}
Created: ${getDateTimeString(props.note.createdAt)}`;

const pinned = ref<boolean>(props.note.pinned === 1 ? true : false);

function setPinned(value: boolean) {
    pinned.value = value;
    props.note.pinned = value ? 1 : 0;
}
</script>

<template>
    <SidebarEntry
        ref="entryRef"
        :icon="PiNotepad"
        type="note"
        :id="props.note.id"
        :title="props.note.title"
        :pinned="props.note.pinned"
        :hover-message="hoverTitle" 
        :editing="editing"
        :is-generating-title="false"
        :is-opened="notesStore.isOpened(props.note.id)"
        :set-pinned="setPinned"
        :edit-name="editNoteName"
        :stop-editing="stopEditing"
        :delete-entry="deleteNote"
    />
</template>