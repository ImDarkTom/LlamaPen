<script setup lang="ts">
import { ref } from 'vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { BsChatLeft } from 'vue-icons-plus/bs';
import { useAllChatsStore } from '../../stores/allChats';
import { RouterLink, useRouter } from 'vue-router';

const allChats = useAllChatsStore();
const router = useRouter();

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
    chatTextElem.classList.add('editing');
}

function stopEditing(save = true) {
    const chatTextElem = chatTextRef.value;

    if (!chatTextElem) {
        return;
    }

    chatTextElem.setAttribute('readonly', '');
    chatTextElem.classList.remove('editing');

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

</script>

<template>
    <RouterLink :to="`/chat/${props.chat.id}`" @mousedown.prevent="navigateToChat" @dblclick="editChatName" class="link-wrapper" :class="{ 'active': props.chat.id === allChats.openedId }">
        <div class="chat-link">
            <BsChatLeft class="chat-icon" />
            <input type="text" 
                class="chat-text" 
                @blur="stopEditing()" 
                @keydown="editKeyPressed" 
                ref="chatTextRef" 
                :value="props.chat.label" 
                readonly>
            <AiOutlineClose class="chat-close" @click="deleteChat" />
        </div>
    </RouterLink>
</template>

<style scoped lang="scss">
.link-wrapper {
    margin: 0.5rem 0;
    background-color: transparent;
    display: flex;
    border-radius: 0.5rem;

    &:hover {
        background-color: var(--bg-3);
    }

    &.active {
        background-color: var(--bg-4);
        @include mixin.shadow-low;
    }

    .chat-link {
        width: 100%;
        height: 100%;
        display: flex;
        padding: 0.5rem;
        flex-direction: row;
        color: var(--txt-1);
        text-decoration: none;
        position: relative;
        box-sizing: content-box;

        &:hover {
            .chat-close {
                display: initial;
            }
        }
        
        .chat-icon {
            box-sizing: border-box;
            padding: 0.1rem;
        }

        .chat-text {
            border: none;
            outline: none;
            margin: 0;
            background-color: transparent;
            color: var(--txt-1);
            flex: 1;
            padding: 0 1ch;
            box-sizing: border-box;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            text-overflow: ellipsis;

            &.editing {
                box-shadow: 0px 0px 0px 1px red inset;
                background-color: var(--bg-1);
            }
        }

        .chat-close {
            position: absolute;
            right: 0;
            margin-right: 0.5rem;
            transition: color 0.15s ease-in-out;
            display: none;

            &:hover {
                color: rgb(255, 100, 100);
            }
        }
    }
}
</style>