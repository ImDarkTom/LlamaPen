<script setup lang="ts">
import { ref } from 'vue';
import TooltipBottom from '../TooltipBottom.vue';
import { BsCopy, BsPen } from 'vue-icons-plus/bs';

defineProps<{
    message: AppMessage,
}>();

function copyMessage(message: OllamaMessage) {
    const tempElem = document.createElement('input');
    tempElem.value = message.content;

    tempElem.select();
    tempElem.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(tempElem.value);

    copyTooltipText.value = "Copied!";

    setTimeout(() => {
        copyTooltipText.value = "Copy text";
    }, 1000);
}

const copyTooltipText = ref<string>("Copy text");
function editMessage() {
    emit('editMessage')
}

const emit = defineEmits(['editMessage']);
</script>

<template>
    <div class="message-options">
        <TooltipBottom v-if="message.role !== 'user'" :text="copyTooltipText">
            <BsCopy title="Copy Text" @click="copyMessage(message)" />
        </TooltipBottom>
        <TooltipBottom v-else text="Edit">
            <BsPen title="Edit" @click="editMessage" />
        </TooltipBottom>
    </div>
</template>

<style scoped lang="scss">
.message-options {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    padding-top: 1rem;

    >* {
        box-sizing: content-box;
        padding: 0.5rem;
        border-radius: 0.5rem;
        cursor: pointer;

        &:hover {
            @include mixin.shadow-low;

            background-color: var(--bg-2);
        }
    }
}
</style>