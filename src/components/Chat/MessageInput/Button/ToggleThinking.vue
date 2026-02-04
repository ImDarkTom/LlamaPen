<script setup lang="ts">
import { computed, watch } from 'vue';
import { BiBrain } from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/config';
import { useProviderManager } from '@/composables/useProviderManager';

const { isLoading, selectedModelCapabilities, selectedModelInfo } = useProviderManager();
const config = useConfigStore();

const model = defineModel()

const selectedModelCanThink = computed(() => selectedModelCapabilities.value.supportsReasoning);

watch(selectedModelCanThink, () => {
    if (selectedModelCanThink.value === false) {
        model.value = false;
    }
});

const selectedAlwaysReasons = computed(() => {
    return !!(
        selectedModelInfo.value.exists
        && selectedModelInfo.value.data.info.providerMetadata?.provider === 'lpcloud'
        && selectedModelInfo.value.data.info.providerMetadata.data.tags?.includes('alwaysReasons')
    );
});

watch(selectedAlwaysReasons, () => {
    if (selectedAlwaysReasons.value) {
        model.value = false;
    }
});

const buttonHoverText = computed<string>(() => {
    if (!selectedModelCanThink.value) return 'Selected model does not have thinking capabilities.';
    else if (selectedAlwaysReasons.value) return 'Thinking cannot be disabled for his model.';
    else return 'Enable thinking.'
});

function toggleCheck(e: Event) {
    if (
        !selectedModelCanThink.value ||
        selectedAlwaysReasons.value
    ) return;
    model.value = (e.target as HTMLInputElement).checked;
}
</script>

<template>
    <ChatMessageInputButtonBase
        :class="{ 
            'bg-primary ring-background! text-background!': modelValue,
            'opacity-50': selectedAlwaysReasons || isLoading,
            'hidden': (config.ui.messageInput.hideUnusedButtons && !selectedModelCanThink) && !isLoading
        }"
        :title="buttonHoverText"
    >
        <label for="thinking-toggle" class="cursor-pointer size-full flex flex-row gap-2 items-center justify-center">
            <BiBrain />
            <span>Think</span>
        </label>
        <input type="checkbox" id="thinking-toggle" class="hidden" :value="modelValue"
            @input="toggleCheck" />
    </ChatMessageInputButtonBase>
</template>