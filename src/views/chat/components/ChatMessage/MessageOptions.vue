<script setup lang="ts">
import { ref } from 'vue';
import { BsCopy, BsPen } from 'vue-icons-plus/bs';
import logger from '@/lib/logger';
import MessageOptionButton from './MessageOptionButton.vue';
import { AiFillInfoCircle } from 'vue-icons-plus/ai';

const props = defineProps<{
    message: ChatMessage;
    done: boolean;
}>();

const emit = defineEmits(['editMessage']);


const copyTooltipText = ref<string>("Copy text");
function copyMessage() {
    const tempElem = document.createElement('input');
    tempElem.value = props.message.content;

    tempElem.select();
    tempElem.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(tempElem.value);

    copyTooltipText.value = "Copied!";
    setTimeout(() => {
        copyTooltipText.value = "Copy text";
    }, 1000);
}


function editMessage() {
    logger.info('Message Options Component', 'Edit message clicked.');

    emit('editMessage');
}

function openInfo() {
    alert(JSON.stringify(props.message, null, 2));
}
</script>

<template>
    <div class="flex flex-row gap-2 pt-1"
        :class="{ 'justify-end': message.type === 'user', 'justify-start': message.type !== 'user' }">
        <MessageOptionButton v-if="done" :text="copyTooltipText">
            <BsCopy class="size-full" title="Copy Text" @click="copyMessage" />
        </MessageOptionButton>
        <MessageOptionButton v-if="message.type === 'user'" text="Edit">
            <BsPen class="size-full" title="Edit" @click="editMessage" />
        </MessageOptionButton>
        <MessageOptionButton v-if="done" text="Message Info">
            <AiFillInfoCircle class="size-full" title="Message Info" @click="openInfo" />
        </MessageOptionButton>
    </div>
</template>