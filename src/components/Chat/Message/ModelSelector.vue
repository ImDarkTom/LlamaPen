<script setup lang="ts">
import logger from '@/lib/logger';
import useMessagesStore from '@/stores/messagesStore';
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { BiError, BiRefresh } from 'vue-icons-plus/bi';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';

const props = defineProps<{
    modelMessageDone: boolean;
    message: ModelChatMessage;
}>();

const messagesStore = useMessagesStore();
const { rawModels, getModel } = useProviderManager();
const { currentProvider } = useProviderManager();

const isOpened = ref<boolean>(false);
const messageModelDisplayName = computed(() => getModel(props.message.model).getDisplayName());

const allModels = computed<ModelInfo[]>(() => {
    return rawModels.value.filter((model) => {
        // Get all models apart from the one the message used
        return props.message.type === 'model' && props.message.model !== model.info.name;
    });
});

function regenerateMessage(model: string) {
    isOpened.value = false;
    logger.info(
        'Message Options Component',
        `Regenerating message id ${props.message.id} with different model ${model}.`,
    );
    messagesStore.regenerateMessage(props.message.id, model);
}
</script>

<template>
    <div class="relative flex flex-row items-center gap-1">
        <Tooltip
            v-if="!messageModelDisplayName && !currentProvider.isLoading()"
            text="Model not found in current model list. You may not be able to regenerate this message with the same model."
            size="small">
            <BiError class="text-warning ml-1" />
        </Tooltip>

        <FloatingMenu
            v-model:is-opened="isOpened"
            preffered-position="bottom"
            :unstyled-button="true"
            :unstyled-menu="true"
            :disabled="!props.modelMessageDone">
            <template #button>
                <div
                    class="flex flex-row p-1 gap-1 group/msg-model bg-transparent rounded-xl items-center transition-all duration-dynamic"
                    :class="{
                        'hover:bg-base-800 cursor-pointer': modelMessageDone,
                    }">
                    <span
                        class="font-medium pl-1 select-none"
                        :class="{ 'font-semibold': messageModelDisplayName }">
                        {{ messageModelDisplayName ?? message.model }}
                    </span>
                    <Tooltip
                        text="Regenerate"
                        :disabled="!modelMessageDone">
                        <BiRefresh
                            v-if="modelMessageDone"
                            class="p-1 size-8 opacity-35 group-hover/msg-model:opacity-100 transition-opacity duration-dynamic" />
                    </Tooltip>
                </div>
            </template>
            <template #menu>
                <div
                    class="max-h-[50vh] w-max max-w-[min(65ch, 100vw)] overflow-y-auto flex flex-col bg-base-700 z-20 p-2 rounded-xl gap-2 shadow-md shadow-base-900">
                    <span class="text-base-100 text-center font-semibold">Regenerate using...</span>
                    <div class="w-full min-h-0.5 bg-base-400"></div>
                    <ChatMessageModelSelectorItem
                        :modelId="message.model"
                        :modelName="messageModelDisplayName ?? message.model"
                        :modelIsAvailable="true"
                        :regenerate-message="regenerateMessage" />
                    <div class="w-full min-h-0.5 bg-base-400"></div>
                    <ChatMessageModelSelectorItem
                        v-for="model in allModels"
                        :key="model.info.id"
                        :modelId="model.info.id"
                        :modelName="model.app.displayName"
                        :regenerate-message="regenerateMessage" />
                </div>
            </template>
        </FloatingMenu>
    </div>
</template>
