<script setup lang="ts">
import { ref } from 'vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { BsChatLeft } from 'vue-icons-plus/bs';
import { useAllChatsStore } from '../../stores/allChats';
import { RouterLink, useRouter } from 'vue-router';

const allChats = useAllChatsStore();
const router = useRouter();
const editing = ref<boolean>(false);

const props = defineProps<{
    chat: Chat,
}>();

function deleteChat(e: MouseEvent) {
    e.preventDefault();

    if (confirm(`Are you sure you want to delete "${props.chat.label}"?`)) {
        allChats.deleteChat(props.chat.id);
        router.push('/');
    }
}

const chatTextRef = ref<HTMLInputElement | null>(null);

function editChatName(e: MouseEvent) {
    e.preventDefault();
    const chatTextElem = chatTextRef.value;

    if (!chatTextElem) {
        return;
    }

    chatTextElem.setAttribute('data-originaltext', chatTextElem.value);
    chatTextElem.removeAttribute('readonly');
    chatTextElem.focus();
    chatTextElem.select();
    chatTextElem.setSelectionRange(0, 999);
    editing.value = true;
}

function stopEditing(save = true) {
    const chatTextElem = chatTextRef.value;

    if (!chatTextElem) {
        return;
    }

    chatTextElem.setAttribute('readonly', '');
    editing.value = false;

    if (!save) {
        chatTextElem.value = chatTextElem.getAttribute('data-originaltext') || "Unnamed chat";
        chatTextElem.removeAttribute('data-originaltext');
        return;
    }

    allChats.editChatName(props.chat.id, chatTextElem.value);
}

function editKeyPressed(e: KeyboardEvent) {
    if (e.key === "Enter") {
        stopEditing();
    } else if (e.key === "Escape") {
        stopEditing(false);
    }
}

function navigateToChat(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey) return;
    router.push(`/chat/${props.chat.id}`);
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


const hoverTitle = `${props.chat.label}
Last message: ${getDateTimeString(props.chat.lastMessage)}
Created: ${getDateTimeString(props.chat.created)}`;

</script>

<template>
    <RouterLink :to="`/chat/${props.chat.id}`" @mousedown.prevent="navigateToChat" @dblclick="editChatName"
        class="my-2 flex flex-col" :title="hoverTitle">
        <div class="group w-full h-full flex flex-row p-2 relative rounded-lg hover:bg-primary-300" :class="{ '!bg-primary-200 shadow-sm shadow-black': props.chat.id === allChats.openedId }">
            <BsChatLeft class="box-border p-0.5" />
            <input type="text" class="border-none outline-none m-0 flex-1 px-2 box-border justify-center items-center cursor-pointer text-ellipsis" @blur="stopEditing()" @keydown="editKeyPressed" ref="chatTextRef"
                :value="props.chat.label" readonly :class="{ '!bg-primary-500 rounded-sm': editing }">
            <AiOutlineClose class="hidden group-hover:block box-content absolute right-0 pr-2 hover:text-red-400 transition-colors duration-150 ease-in-out" @click="deleteChat" />
        </div>
    </RouterLink>
</template>