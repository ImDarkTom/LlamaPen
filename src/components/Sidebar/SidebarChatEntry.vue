<script setup lang="ts">
import { ref } from 'vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { BsChatLeft, BsFillPinAngleFill, BsPinAngle } from 'vue-icons-plus/bs';
import { useRouter } from 'vue-router';
import SidebarRouterLink from './SidebarRouterLink.vue';
import useChatsStore from '@/stores/chatsStore';

const chatsStore = useChatsStore();

const router = useRouter();

const editing = ref<boolean>(false);

const props = defineProps<{
    chat: Chat,
}>();

function deleteChat(e: MouseEvent) {
    e.preventDefault();

    if (confirm(`Are you sure you want to delete "${props.chat.title}"?`)) {
        chatsStore.deleteChat(props.chat.id);
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

    chatsStore.renameChat(props.chat.id, chatTextElem.value);
}

function editKeyPressed(e: KeyboardEvent) {
    if (e.key === "Enter") {
        stopEditing();
    } else if (e.key === "Escape") {
        stopEditing(false);
    }
}

function getDateTimeString(time: Date | undefined) {
    if (time === undefined) return "Unknown";

    return time.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}


const hoverTitle = `${props.chat.title}
Last message: ${getDateTimeString(props.chat.lastestMessageDate)}
Created: ${getDateTimeString(props.chat.createdAt)}`;

const hoveringOverIcon = ref<boolean>(false);
const pinned = ref<boolean>(props.chat.pinned === 1 || false);

function setPinned(value: boolean) {
    chatsStore.setPinned(props.chat.id, value);
}
</script>

<template>
    <SidebarRouterLink :to="`/chat/${props.chat.id}`" @dblclick="editChatName" class="my-2 flex flex-col"
        :title="hoverTitle" role="listitem">
        <div class="group w-full h-full flex flex-row p-2 pointer-coarse:p-3 relative rounded-lg hover:bg-primary-300 transition-all duration-150"
            :class="{ '!bg-primary-300 ring-1 ring-inset ring-txt-1/50': chatsStore.isOpened(props.chat.id) }">
            <div class="box-content shrink-0" @mouseenter="hoveringOverIcon = true"
                @mouseleave="hoveringOverIcon = false">
                <template v-if="hoveringOverIcon || pinned">
                    <BsFillPinAngleFill v-if="pinned" class="box-border p-0.5 text-red-400"
                        @mousedown="setPinned(false)" />
                    <BsPinAngle v-else class="box-border p-0.5" @mousedown="setPinned(true)" />
                </template>
                <BsChatLeft v-else class="box-border p-0.5" />
            </div>
            <input type="text"
                class="border-none outline-none m-0 flex-1 px-2 box-border justify-center items-center cursor-pointer text-ellipsis"
                @blur="stopEditing()" @keydown="editKeyPressed" ref="chatTextRef" :value="props.chat.title" readonly
                :class="{ '!bg-primary-500 rounded-sm': editing, 'opacity-50': $props.chat.isGeneratingTitle }">
            <AiOutlineClose
                class="hidden shrink-0 group-hover:block box-content pr-0 hover:text-red-400 transition-colors duration-150 ease-in-out"
                @click="deleteChat" />
        </div>
    </SidebarRouterLink>
</template>