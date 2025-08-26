<script setup lang="ts">
import { useModelList } from '@/composables/useModelList';
import { computed, watch } from 'vue';
import { BiBrain } from 'vue-icons-plus/bi';
import MessageInputButton from './MessageInputButton.vue';

const { selectedModelCapabilities, selectedModelInfo } = useModelList();

defineProps(['modelValue']);
const emits = defineEmits(['update:modelValue']);

const selectedModelCanThink = computed(() => selectedModelCapabilities.value.includes('thinking'));

watch(selectedModelCanThink, () => {
    if (!selectedModelCanThink.value) {
        emits('update:modelValue', false)
    }
});

const selectedAlwaysReasons = computed(() => {
    return !!(
        selectedModelInfo.value.exists &&
        selectedModelInfo.value.data.modelData.llamapenMetadata?.tags?.includes('alwaysReasons')
    );
});

watch(selectedAlwaysReasons, () => {
    if (selectedAlwaysReasons.value) {
        emits('update:modelValue', true);
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
    emits('update:modelValue', (e.target as HTMLInputElement).checked);
}
</script>

<template>
    <MessageInputButton
        :class="{ 
            'bg-primary ring-background! text-background!': modelValue,
            'opacity-50': !selectedModelCanThink || selectedAlwaysReasons
        }"
        :title="buttonHoverText"
    >
        <label for="thinking-toggle" class="cursor-pointer size-full flex flex-row gap-2 items-center justify-center">
            <BiBrain />
            <span>Think</span>
        </label>
        <input type="checkbox" id="thinking-toggle" class="hidden" :value="modelValue"
            @input="toggleCheck" />
    </MessageInputButton>
</template>