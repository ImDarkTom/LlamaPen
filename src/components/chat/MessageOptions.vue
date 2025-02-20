<script setup lang="ts">
import { ref } from 'vue';
import TooltipBottom from '../ui/TooltipBottom.vue';
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
function editMessage(_message: OllamaMessage) {
    emit('editMessage');
}

const emit = defineEmits(['editMessage']);
</script>

<template>
    <div class="flex flex-row gap-2 pt-4">
        <TooltipBottom class="message-option" v-if="message.role !== 'user'" :text="copyTooltipText">
            <BsCopy  title="Copy Text" @click="copyMessage(message)" />
        </TooltipBottom>
        <TooltipBottom class="message-option" v-else text="Edit">
            <BsPen title="Edit" @click="editMessage(message)" />
        </TooltipBottom>
    </div>
</template>

<style scoped>
@reference "@/styles/style.css";

.message-option {
    @apply box-content p-2 rounded-lg cursor-pointer;
}

.message-option:hover {
    @apply shadow-sm shadow-black bg-primary-400;
}
</style>