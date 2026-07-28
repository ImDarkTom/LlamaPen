<script setup lang="ts">
import { computed, watch } from 'vue';
import { BiBrain, BiSolidBrain } from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/useConfigStore';
import { useProviderManager } from '@/composables/useProviderManager';

const { isLoading, selectedModelCapabilities, selectedModelInfo } = useProviderManager();
const config = useConfigStore();

const model = defineModel();

const selectedModelCanThink = computed(() => {
    return (
        selectedModelCapabilities.value.includes('reasoning') || selectedModelCapabilities.value.includes('unavailable')
    );
});

const selectedModelCapabilitiesUnavailable = computed(() => {
    return selectedModelCapabilities.value.includes('unavailable');
});

watch(selectedModelCanThink, () => {
    if (selectedModelCanThink.value === false) {
        model.value = false;
    }
});

const selectedAlwaysReasons = computed(() => {
    return !!(
        selectedModelInfo.value.exists && selectedModelInfo.value.data.info.capabilities.includes('always-reasons')
    );
});

watch(selectedAlwaysReasons, () => {
    if (selectedAlwaysReasons.value) {
        model.value = true;
    }
});

const buttonHoverText = computed<string>(() => {
    if (selectedModelCapabilitiesUnavailable.value) return 'Model capabilities unknown.';
    else if (!selectedModelCanThink.value) return 'Selected model does not have thinking capabilities.';
    else if (selectedAlwaysReasons.value) return 'Thinking cannot be disabled for this model.';
    else return 'Enable thinking.';
});

function toggleCheck() {
    if (!selectedModelCanThink.value || selectedAlwaysReasons.value) return;
    model.value = !model.value;
}
</script>

<template>
    <ChatMessageInputButtonBase
        class="cursor-pointer flex flex-row gap-2 items-center"
        :class="{
            'bg-base-600!': modelValue,
            'opacity-50': selectedAlwaysReasons || isLoading,
            hidden: config.ui.messageInput.hideUnusedButtons && !selectedModelCanThink && !isLoading,
        }"
        :title="buttonHoverText"
        @click="toggleCheck">
        <component
            :is="modelValue ? BiSolidBrain : BiBrain"
            class="size-4" />
        <span>Think</span>
        <input
            type="checkbox"
            id="thinking-toggle"
            class="hidden"
            :value="modelValue"
            @input="toggleCheck" />
    </ChatMessageInputButtonBase>
</template>
