<script setup lang="ts">
import { computed, ref } from 'vue';
import { BiChat, BiDotsHorizontalRounded, BiPencil, BiPin, BiSolidChat, BiSolidPin, BiTrash } from 'vue-icons-plus/bi';
import useChatsStore from '@/stores/chatsStore';
import router from '@/lib/router';
import useMessagesStore from '@/stores/messagesStore';
import { getDateTimeString } from '@/utils/core/getDateTimeString';
import { useConfigStore } from '@/stores/config';

const props = defineProps<{
    chat: Chat,
}>();

const { setPinned, isOpened, renameChat, deleteChat } = useChatsStore();
const messagesStore = useMessagesStore();
const config = useConfigStore();

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

function editChatName(e?: MouseEvent) {
    e?.preventDefault();
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
function promptDeleteChat(e?: MouseEvent) {
    e?.preventDefault();

    if (confirm(`Are you sure you want to delete "${props.chat.title}"?`)) {
        deleteChat(props.chat.id);
        router.push('/');
    }
}

const dropdownPinText = computed(() => isPinned.value ? 'Unpin' : 'Pin');
const dropdownPinIcon = computed(() => isPinned.value ? BiSolidPin : BiPin);

const actions: MenuEntry<MouseEvent>[] = [
    {
        type: 'text',
        text: dropdownPinText.value,
        icon: dropdownPinIcon.value,
        onClick: () => setPinned(props.chat.id, !isPinned.value),
    },
    {
        type: 'text',
        text: 'Rename',
        icon: BiPencil,
        onClick: editChatName,
    },
    {
        type: 'divider',
    },
    {
        type: 'text',
        text: 'Delete',
        icon: BiTrash,
        onClick: promptDeleteChat,
        category: 'danger',
    },
];

const icon = computed(() => {
    if (isHoveringOverIcon.value) {
        if (isPinned.value) {
            return BiSolidPin;
        } else { 
            return BiPin;
        };
    }

    if (isPinned.value && isChatOpened.value) {
        return BiSolidPin;
    }

    if (isPinned.value) {
        return BiPin;
    }

    if (isChatOpened.value) {
        return BiSolidChat;
    }

    return BiChat;
});

</script>

<template>
	<SidebarRouterLink
        role="listitem"
        :to="`/chat/${props.chat.id}`" 
        :title="hoverMessage" 
        @dblclick="editChatName" >
        <div 
            class="group relative flex flex-row gap-1 p-1.5 px-2 pr-6 not-has-[div.absolute:hover]:hover:bg-background rounded-sm"
            :class="{ 'bg-background-light!': isChatOpened }">
            <div 
                v-if="config.ui.sidebar.entryIcons"
                class="box-content aspect-square"
                @mouseenter="isHoveringOverIcon = true"
                @mouseleave="isHoveringOverIcon = false" >
                <component
                    :is="icon"
                    class="box-border p-0.5"
                    @mousedown.stop
                    @click="setPinned(chat.id, !isPinned)" />
            </div>
            <input
                type="text"
                ref="entryTextRef" 
                class="w-full cursor-pointer truncate outline-none"
                :value="props.chat.title"
                @blur="stopEditing()" 
                @keydown="editKeyPressed" 
                :readonly="!isEditingName"
                :class="{ 
                    'cursor-text! rounded-sm border-2 border-border-muted': isEditingName,
                    'animate-blink': isGeneratingTitle,
                }">
            <div class="size-8 p-1 block md:not-group-hover:hidden absolute right-0 top-1/2 -translate-y-1/2 rounded-sm 
                bg-background-dark md:bg-background 
                hover:text-text hover:bg-background-light"
                :class="{ 
                    'bg-background-light! block!': isChatOpened
                }">
                <FloatingActionMenu :actions>
                    <div @mousedown.left.stop>
                        <BiDotsHorizontalRounded />
                    </div>
                </FloatingActionMenu>
            </div>
        </div>
    </SidebarRouterLink>
</template>