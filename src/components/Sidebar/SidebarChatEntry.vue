<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import useChatsStore from '@/stores/chatsStore';
import SidebarEntry from './SidebarEntry.vue';
import { getDateTimeString } from '@/utils/time';
import { BsChatLeft } from 'vue-icons-plus/bs';

const chatsStore = useChatsStore();
const router = useRouter();

const props = defineProps<{
    chat: Chat,
}>();

const editing = ref<boolean>(false);

const entryRef = ref<InstanceType<typeof SidebarEntry> | null>(null);
const entryTextRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
    entryTextRef.value = entryRef.value?.entryTextRef || null;
});

function deleteChat(e: MouseEvent) {
    e.preventDefault();

    if (confirm(`Are you sure you want to delete "${props.chat.title}"?`)) {
        chatsStore.deleteChat(props.chat.id);
        router.push('/');
    }
}

function editChatName(e: MouseEvent) {
    e.preventDefault();
    const chatTextElem = entryTextRef.value;

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
    const chatTextElem = entryTextRef.value;

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

    chatsStore.renameChat(props.chat.id, chatTextElem.value);
}

const hoverTitle = `${props.chat.title}
Last message: ${getDateTimeString(props.chat.lastestMessageDate)}
Created: ${getDateTimeString(props.chat.createdAt)}`;


function setPinned(value: boolean) {
    chatsStore.setPinned(props.chat.id, value);
}
</script>

<template>
    <SidebarEntry 
        ref="entryRef"
        :icon="BsChatLeft"
        type="chat"
        :id="props.chat.id"
        :title="props.chat.title"
        :pinned="props.chat.pinned" 
        :hover-message="hoverTitle"
        :editing="editing"
        :is-generating-title="props.chat.isGeneratingTitle || false"
        :is-opened="chatsStore.isOpened(props.chat.id)"
        :set-pinned="setPinned" 
        :edit-name="editChatName"
        :stop-editing="stopEditing"
        :delete-entry="deleteChat"
    />
</template>