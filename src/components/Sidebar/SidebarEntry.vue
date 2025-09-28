<script setup lang="ts">
import { computed, ref } from 'vue';
import SidebarRouterLink from './SidebarRouterLink.vue';
import { BiChat, BiPin, BiSolidPin, BiX } from 'vue-icons-plus/bi';
import useChatsStore from '@/stores/chatsStore';
import router from '@/lib/router';
import useMessagesStore from '@/stores/messagesStore';
import { getDateTimeString } from '@/utils/core/getDateTimeString';

const props = defineProps<{
    chat: Chat,
}>();

const { setPinned, isOpened, renameChat, deleteChat } = useChatsStore();
const messagesStore = useMessagesStore();

const entryTextRef = ref<HTMLInputElement | null>(null);
const isHoveringOverIcon = ref<boolean>(false);
const isEditingName = ref<boolean>(false);
const nameBeforeEdit = ref<string>('');

const isPinned = computed(() => props.chat.pinned === 1 || false);
const isGeneratingTitle = computed(() => messagesStore.chatsGeneratingTitles.includes(props.chat.id));
const isChatOpened = computed(() => isOpened(props.chat.id));

const hoverMessage = computed(() => 
`${props.chat.title}
Last message: ${getDateTimeString(props.chat.lastestMessageDate)}
Created: ${getDateTimeString(props.chat.createdAt)}`
);


// Editing
function editKeyPressed(e: KeyboardEvent) {
    if (e.key === "Enter") {
        stopEditing();
    } else if (e.key === "Escape") {
        stopEditing(false);
    }
}

function editChatName(e: MouseEvent) {
    e.preventDefault();
    const chatTextElem = entryTextRef.value;
    if (!chatTextElem) {
        return;
    }

    nameBeforeEdit.value = chatTextElem.value;
    isEditingName.value = true;
    chatTextElem.focus();
    chatTextElem.select();
    chatTextElem.setSelectionRange(0, 999);
}

function stopEditing(saveName = true) {
    const chatTextElem = entryTextRef.value;
    if (!chatTextElem) {
        return;
    }

    isEditingName.value = false;

    if (saveName) {
        renameChat(props.chat.id, chatTextElem.value);
    } else {
        chatTextElem.value = nameBeforeEdit.value || "Unnamed chat";
    }
    
}

// Chat controls
function promptDeleteChat(e: MouseEvent) {
    e.preventDefault();

    if (confirm(`Are you sure you want to delete "${props.chat.title}"?`)) {
        deleteChat(props.chat.id);
        router.push('/');
    }
}
</script>

<template>
	<SidebarRouterLink
        :to="`/chat/${props.chat.id}`" 
        class="my-2 flex flex-col"
        :title="hoverMessage" 
        @dblclick="editChatName" 
        role="listitem" >
        <div 
            class="group w-full h-10 flex flex-row gap-2 p-2 pointer-coarse:p-3 relative rounded-lg hover:text-text hover:bg-background transition-quick"
            :class="{ '!bg-background-light ring-1 ring-inset ring-border': isChatOpened }">
            <div 
                class="box-content aspect-square"
                @mouseenter="isHoveringOverIcon = true"
                @mouseleave="isHoveringOverIcon = false" >
                <component
                    v-if="isHoveringOverIcon || isPinned"
                    :is="isPinned ? BiSolidPin : BiPin"
                    class="box-border p-0.5 text-primary"
                    @mousedown.stop="setPinned(chat.id, !isPinned)" />
                <component
                    v-else 
                    :is="BiChat" 
                    class="box-border p-0.5" />
            </div>
            <input
                type="text"
                ref="entryTextRef" 
                class="cursor-pointer text-ellipsis w-full group-hover:w-[calc(100%-1rem)] outline-none group-hover:pointer-coarse:w-[calc(100%-1.5rem)]"
                :value="props.chat.title"
                @blur="stopEditing()" 
                @keydown="editKeyPressed" 
                :readonly="!isEditingName"
                :class="{ 
                    'rounded-sm border-2 border-border-muted': isEditingName,
                    'animate-blink': isGeneratingTitle,
                }">
            <div 
                class="hidden group-hover:block hover:text-danger transition-all duration-dynamic" 
                @mousedown.stop="promptDeleteChat">
                <BiX />
            </div>
        </div>
    </SidebarRouterLink>
</template>