<script setup lang="ts">
import { ref } from 'vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { BsFillPinAngleFill, BsPinAngle } from 'vue-icons-plus/bs';
import { RouterLink, useRouter } from 'vue-router';
import { PiNotepad } from 'vue-icons-plus/pi';
import useNotesStore from '@/stores/notesStore';

const notesStore = useNotesStore();
const router = useRouter();
const editing = ref<boolean>(false);

const props = defineProps<{
    note: Note,
}>();

function deleteTextpad(e: MouseEvent) {
    e.preventDefault();

    if (confirm(`Are you sure you want to delete "${props.note.title}"?`)) {
        notesStore.deleteNote(props.note.id);
        router.push('/textpad');
    }
}

const textpadNameRef = ref<HTMLInputElement | null>(null);

function editTextpadName(e: MouseEvent) {
    e.preventDefault();
    const textpadNameElem = textpadNameRef.value;

    if (!textpadNameElem) {
        return;
    }

    textpadNameElem.setAttribute('data-originaltext', textpadNameElem.value);
    textpadNameElem.removeAttribute('readonly');
    textpadNameElem.focus();
    textpadNameElem.select();
    textpadNameElem.setSelectionRange(0, 999);
    editing.value = true;
}

function stopEditing(save = true) {
    const textpadNameElem = textpadNameRef.value;

    if (!textpadNameElem) {
        return;
    }

    textpadNameElem.setAttribute('readonly', '');
    editing.value = false;

    if (!save) {
        textpadNameElem.value = textpadNameElem.getAttribute('data-originaltext') || "Unnamed chat";
        textpadNameElem.removeAttribute('data-originaltext');
        return;
    }

    notesStore.editNoteName(props.note.id, textpadNameElem.value);
}

function editKeyPressed(e: KeyboardEvent) {
    if (e.key === "Enter") {
        stopEditing();
    } else if (e.key === "Escape") {
        stopEditing(false);
    }
}

function navigateToTextpad(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey) return;
    router.push(`/textpad/${props.note.id}`);
}

function getDateTimeString(timeInt: unknown) {
    if (typeof timeInt === 'number') {
        return new Date(timeInt).toLocaleString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } else {
        return "Unknown";
    }
}


const hoverTitle = `${props.note.title}
Last edited: ${getDateTimeString(props.note.lastEdited.getDate())}
Created: ${getDateTimeString(props.note.createdAt.getDate())}`;

const hoveringOverIcon = ref<boolean>(false);
const pinned = ref<boolean>(props.note.pinned === 1 ? true : false);

function setPinned(value: boolean) {
    pinned.value = value;
    props.note.pinned = value ? 1 : 0;
}
</script>

<template>
    <RouterLink :to="`/textpad/${props.note.id}`" @mousedown.prevent="navigateToTextpad" @dblclick="editTextpadName"
        class="my-2 flex flex-col" :title="hoverTitle" role="listitem">
        <div class="group w-full h-full flex flex-row p-2 relative rounded-lg hover:bg-primary-300 transition-all duration-150"
            :class="{ '!bg-primary-200 shadow-sm shadow-black/50': props.note.id === notesStore.openedNoteId }">
            <div class="box-content shrink-0" @mouseenter="hoveringOverIcon = true"
                @mouseleave="hoveringOverIcon = false">
                <template v-if="hoveringOverIcon || pinned">
                    <BsFillPinAngleFill v-if="pinned" class="box-border p-0.5 text-red-400"
                        @mousedown="setPinned(false)" />
                    <BsPinAngle v-else class="box-border p-0.5" @mousedown="setPinned(true)" />
                </template>
                <PiNotepad v-else class="box-border p-0.5" />
            </div>
            <input type="text"
                class="border-none outline-none m-0 flex-1 px-2 box-border justify-center items-center cursor-pointer text-ellipsis"
                @blur="stopEditing()" @keydown="editKeyPressed" ref="textpadNameRef" :value="props.note.title" readonly
                :class="{ '!bg-primary-500 rounded-sm': editing }">
            <AiOutlineClose
                class="hidden shrink-0 group-hover:block box-content pr-0 hover:text-red-400 transition-colors duration-150 ease-in-out"
                @click="deleteTextpad" />
        </div>
    </RouterLink>
</template>