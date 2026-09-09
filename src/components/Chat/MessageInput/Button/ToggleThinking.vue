<script setup lang="ts">
import { computed, watch } from 'vue';
import { BiBrain, BiChevronUp, BiSolidBrain } from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/useConfigStore';
import { useProviderManager, type ModelReasoningOptions } from '@/composables/useProviderManager';

const { getSelectedModel, currentProvider } = useProviderManager();
const config = useConfigStore();

const model = defineModel();

const selectedModelReasoning = computed<ModelReasoningOptions | null>(() => {
    const reasoningInfo = getSelectedModel().reasoning;

    if (typeof reasoningInfo === 'undefined') {
        return null;
    } else if (getSelectedModel().getCapabilities().includes('unavailable')) {
        return {
            default_enabled: false,
        };
    } else {
        return reasoningInfo;
    }
});

const selectedModelCanThink = computed(() => {
    return (
        typeof getSelectedModel().reasoning !== 'undefined' ||
        getSelectedModel().getCapabilities().includes('unavailable')
    );
});

const selectedModelCapabilitiesUnavailable = computed(() => {
    return getSelectedModel().getCapabilities().includes('unavailable');
});

watch(selectedModelCanThink, () => {
    if (selectedModelCanThink.value === false) {
        model.value = false;
    }
});

watch(selectedModelReasoning, (newVal) => {
    if (!newVal) {
        model.value = false;
    } else if (newVal.mandatory && newVal.default_enabled) {
        model.value = true;
    }
});

const buttonHoverText = computed<string>(() => {
    if (selectedModelCapabilitiesUnavailable.value) return 'Model capabilities unknown.';
    else if (!selectedModelCanThink.value) return 'Selected model does not have thinking capabilities.';
    else if (selectedModelReasoning.value?.mandatory) return 'Thinking cannot be disabled for this model.';
    else return 'Enable thinking.';
});

function toggleCheck() {
    if (!selectedModelCanThink.value || selectedModelReasoning.value?.mandatory) return;
    model.value = !model.value;
}

const reasoningEffort = computed({
    get: () => {
        const stored = config.chat.thinking.effort;
        const supported = selectedModelReasoning.value?.supported_efforts;

        return stored && supported?.includes(stored) ? stored : (selectedModelReasoning.value?.default_effort ?? null);
    },
    set: (value) => {
        config.chat.thinking.effort = value;
    },
});

const hasReasoningOptions = computed(() => {
    const reasoning = selectedModelReasoning.value;

    return Boolean(reasoning?.supported_efforts?.length || reasoning?.supports_max_tokens);
});

function setMaxTokens(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    config.chat.thinking.maxTokens = Number.isFinite(value) && value > 0 ? value : null;
}

const isOpened = ref(false);
</script>

<template>
    <div class="group flex flex-row">
        <ChatMessageInputButtonBase
            class="cursor-pointer flex flex-row gap-2 items-center"
            :class="{
                'rounded-r-none!': hasReasoningOptions,
                'bg-base-600!': modelValue,
                'opacity-50': selectedModelReasoning?.mandatory || currentProvider.isLoading(),
                hidden:
                    config.ui.messageInput.hideUnusedButtons && !selectedModelCanThink && !currentProvider.isLoading(),
            }"
            :title="buttonHoverText"
            @click="toggleCheck"
            :disabled="selectedModelReasoning?.mandatory || currentProvider.isLoading()">
            <component
                :is="modelValue ? BiSolidBrain : BiBrain"
                class="size-4" />
            <span>Think</span>
            <input
                type="checkbox"
                id="thinking-toggle"
                class="hidden"
                :checked="modelValue"
                @input="toggleCheck" />
        </ChatMessageInputButtonBase>
        <FloatingMenu
            v-if="hasReasoningOptions"
            v-model:is-opened="isOpened"
            preffered-position="top"
            :unstyled-button="true">
            <template #button>
                <button
                    class="border-l border-transparent not-hover:group-hover:border-base-600 group-hover:bg-base-700 cursor-pointer rounded-r-lg transition-all duration-dynamic hover:bg-base-700 active:scale-98 h-10 p-2"
                    :class="{
                        'bg-base-600! hover:bg-base-700!': modelValue,
                    }">
                    <BiChevronUp
                        class="transition-transform size-5"
                        :class="{ 'rotate-180': isOpened }" />
                </button>
            </template>
            <template #menu>
                <fieldset
                    v-if="selectedModelReasoning?.supported_efforts?.length"
                    class="flex flex-col h-full">
                    <legend>Reasoning Effort</legend>
                    <div
                        v-for="effort in selectedModelReasoning?.supported_efforts"
                        :key="effort"
                        class="flex flex-row rounded-md hover:bg-base-600">
                        <input
                            type="radio"
                            name="reasoning-effort"
                            class="accent-primary hover:accent-primary-hover active:accent-primary-active"
                            :value="effort"
                            v-model="reasoningEffort"
                            :id="`reasoning-effort-${effort}`" />
                        <label
                            class="text-sm font-medium p-2 w-full"
                            :for="`reasoning-effort-${effort}`">
                            <span class="capitalize">
                                {{ effort }}
                            </span>
                            <span
                                v-if="effort === selectedModelReasoning?.default_effort"
                                class="ml-2"
                                >(Default)</span
                            >
                        </label>
                    </div>
                </fieldset>
                <div v-if="selectedModelReasoning?.supports_max_tokens">
                    <label for="reasoning-max-tokens">Max reasoning tokens (overrides effort):</label>
                    <input
                        type="number"
                        name="reasoning-max-tokens"
                        id="reasoning-max-tokens"
                        step="1"
                        min="0"
                        :value="config.chat.thinking.maxTokens ?? ''"
                        @input="setMaxTokens" />
                </div>
            </template>
        </FloatingMenu>
    </div>
</template>
