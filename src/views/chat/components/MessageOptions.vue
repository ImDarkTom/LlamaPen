<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TooltipBottom from '@/components/Tooltip/Tooltip.vue';
import { BsCopy, BsPen } from 'vue-icons-plus/bs';
import logger from '@/utils/logger';
import ollamaApi from '@/utils/ollama';
import useMessagesStore from '@/stores/messagesStore';

const messagesStore = useMessagesStore();

const props = defineProps<{
    message: ChatMessage,
}>();

function copyMessage(message: ChatMessage) {
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
function editMessage(_message: ChatMessage) {
    logger.info('Message Options Component', 'Edit message clicked.');

    emit('editMessage');
}

const emit = defineEmits(['editMessage']);

const allModels = ref<ModelList>([]);
onMounted(async () => {
    allModels.value = await ollamaApi.getModels();
});

function changeMessageModel(e: Event) {
    const newValue = (e.target as HTMLSelectElement).value;

    console.log(props.message.id, newValue);

    messagesStore.regenerateMessage(props.message.id, newValue);
}

function shouldShowRegenOption(message: ChatMessage): message is ModelChatMessage {
    return message.type === 'model' && (message.status === 'finished' || message.status === 'cancelled');
}

</script>

<template>
    <div class="flex flex-row gap-2 pt-1"
        :class="{ 'justify-end': message.type === 'user', 'justify-start': message.type !== 'user' }">
        <TooltipBottom class="message-option" :text="copyTooltipText">
            <BsCopy class="size-full" title="Copy Text" @click="copyMessage(message)" />
        </TooltipBottom>
        <TooltipBottom class="message-option" v-if="message.type === 'user'" text="Edit">
            <BsPen class="size-full" title="Edit" @click="editMessage(message)" />
        </TooltipBottom>
        <TooltipBottom class="box-border h-9 mt-1 rounded-lg cusror-pointer" v-if="shouldShowRegenOption(message)" text="Change model">
            <div class="flex flex-row">
                <select class="bg-primary-400 hover:bg-primary-300 text-txt-2 p-2 rounded-lg transition-all duration-100 cursor-pointer" @change="e => changeMessageModel(e)">
                    <option :value="message.model" class="text-txt-1">↻ Retry with {{ message.model }}</option>
                    <option v-for="model in allModels"
                        :selected="model.model === message.model" :value="model.model">
                        {{ model.name }}
                    </option>
                </select>
            </div>
        </TooltipBottom>
    </div>
</template>

<style scoped>
@reference "@/styles/style.css";

.message-option {
    @apply box-border size-9 p-2 mt-1 rounded-lg cursor-pointer;
}

.message-option:hover {
    @apply bg-primary-400;
}
</style>