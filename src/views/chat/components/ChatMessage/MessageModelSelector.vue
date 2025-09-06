<script setup lang="ts">
import DropdownMenu from '@/components/Dropdown/DropdownMenu.vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import logger from '@/lib/logger';
import useMessagesStore from '@/stores/messagesStore';
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { BsCloudSlash } from 'vue-icons-plus/bs';
import MessageModelSelectorItem from './MessageModelSelectorItem.vue';
import { BiError, BiRefresh } from 'vue-icons-plus/bi';

const props = defineProps<{
    modelMessageDone: boolean;
    message: ModelChatMessage;
}>();

const messagesStore = useMessagesStore();
const { models, getModelInfo, modelIds, loading } = useModelList();

const isOpened = ref<boolean>(false);
const messageModelIsApi = computed<boolean>(() => /\//g.test(props.message.model));
const messageModelInfo = computed<{
    exists: true;
    data: ModelInfoListItem;
} | {
    exists: false;
    data: null;
}>(() => {
    if (modelIds.value.includes(props.message.model)) {
        return getModelInfo(props.message.model);
    }
    return { exists: false, data: null }
});

const allModels = computed<ModelInfoListItem[]>(() => {
    return models.value.filter(model => {
        // Get all models apart from the one the message used
        return props.message.type === 'model' && props.message.model !== model.modelData.name
    });
});

function changeModel(e: MouseEvent) {
    if (!props.modelMessageDone) return;
    e.preventDefault();

    isOpened.value = !isOpened.value;
}

function closeModelSelection() {
    if (!isOpened.value) return;

    isOpened.value = false;
}

function regenerateMessage(model: string) {
    isOpened.value = false;
    logger.info('Message Options Component', `Regenerating message id ${props.message.id} with different model ${model}.`);
    messagesStore.regenerateMessage(props.message.id, model);
}

const warningText = computed(() => {
    if (messageModelIsApi.value) {
        return "This message was generated using LlamaPen API. Regeneration may not be possible unless LlamaPen API is enabled."
    } else {
        return "Model not found in current model list. You may not be able to regenerate this message with the same model.";
    }
});

</script>

<template>
    <div class="relative flex flex-row items-center gap-1" v-mousedown-outside="closeModelSelection">
        <Tooltip
            v-if="!messageModelInfo.exists && !loading"
            :text=warningText
            size="small">
            <BsCloudSlash v-if="messageModelIsApi" class="text-warning size-5 ml-1 translate-y-0.5" />
            <BiError v-else class="text-warning ml-1" />
        </Tooltip>
        
        <div 
            class="flex flex-row p-1 gap-1 group/msg-model bg-transparent rounded-xl items-center transition-colors duration-dynamic"
            :class="{ 'hover:bg-background-light cursor-pointer': modelMessageDone }" 
            @mousedown="changeModel" >
            <span 
                class="font-medium pl-1 select-none"
                :class="{ 'font-semibold': messageModelInfo.exists }">
                {{ messageModelInfo.exists ? messageModelInfo.data.displayName : message.model }}
            </span>
            <Tooltip text="Regenerate" :disabled="!modelMessageDone">
                <BiRefresh v-if="modelMessageDone"
                    class="p-1 size-8 opacity-35 group-hover/msg-model:opacity-100 transition-opacity duration-dynamic" />
            </Tooltip>
        </div>
        <DropdownMenu direction="down" :unstyled="true" :opened="isOpened" :include-notch="true">
            <div 
                v-if="isOpened"
                class="max-h-[50vh] w-max max-w-[min(65ch, 100vw)] overflow-y-auto absolute top-0 left-[50%] -translate-x-[50%] flex flex-col bg-surface z-20 p-2 rounded-xl gap-2 shadow-md shadow-background">
                <span class="text-text text-center font-semibold">Regenerate using...</span>
                <div class="w-full min-h-0.5 bg-border"></div>
                <MessageModelSelectorItem
                    :modelId="message.model"
                    :modelName="messageModelInfo.exists ? messageModelInfo.data.displayName : message.model"
                    :regenerate-message="regenerateMessage" />
                <div class="w-full min-h-0.5 bg-border"></div>
                <MessageModelSelectorItem
                    v-for="model in allModels" 
                    :key="model.modelData.digest"
                    :modelId="model.modelData.model"
                    :modelName="model.displayName"
                    :regenerate-message="regenerateMessage" />
            </div>
        </DropdownMenu>
    </div>
</template>