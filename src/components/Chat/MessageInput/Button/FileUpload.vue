<script setup lang="ts">
import { computed } from 'vue';
import { BiImageAdd } from 'vue-icons-plus/bi';
import { useProviderManager } from '@/composables/useProviderManager';

const { getSelectedModel } = useProviderManager();

defineProps<{
    onChange: (event: Event) => void;
}>();

const selectedModelHasVision = computed(() => {
    return (
        getSelectedModel().getCapabilities().includes('vision') ||
        getSelectedModel().getCapabilities().includes('unavailable')
    );
});

const selectedModelCapabilitiesUnavailable = computed(() => {
    return getSelectedModel().getCapabilities().includes('unavailable');
});

function onClick(e: MouseEvent) {
    if (!selectedModelHasVision.value) {
        e.preventDefault();
        return;
    }
}
</script>

<template>
    <ChatMessageInputButtonBase
        class="aspect-square p-0!"
        :class="{
            'opacity-50 cursor-not-allowed': !selectedModelHasVision,
        }"
        :title="
            selectedModelCapabilitiesUnavailable
                ? 'Upload file(s) - model capabilities unknown'
                : selectedModelHasVision
                  ? 'Upload file(s)'
                  : 'Selected model does not have vision capabilities'
        ">
        <label
            for="file-upload"
            class="cursor-pointer size-full flex items-center justify-center">
            <BiImageAdd class="size-5" />
        </label>
        <input
            type="file"
            id="file-upload"
            class="hidden"
            accept="image/*"
            multiple
            @change="onChange"
            @click="onClick" />
    </ChatMessageInputButtonBase>
</template>
