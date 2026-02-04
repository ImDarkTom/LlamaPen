<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import useUserStore from '@/stores/user';
import { computed } from 'vue';
import { BiImageAdd } from 'vue-icons-plus/bi';
import { useProviderManager } from '@/composables/useProviderManager';

const userStore = useUserStore();
const config = useConfigStore();
const { selectedModelCapabilities } = useProviderManager();

defineProps<{
    onChange: (event: Event) => void
}>();

const selectedModelHasVision = computed(() => {
    return selectedModelCapabilities.value.supportsVision
});

const cloudNotAllowed = computed(() => {
    return config.cloud.enabled && !userStore.isPremium;
});

function onClick(e: MouseEvent) {
    if (!selectedModelHasVision.value) {
        e.preventDefault();
        return;
    }

    if (cloudNotAllowed.value) {
        alert('Send attachments to Cloud models with LlamaPen Cloud Premium. Visit the Account page to learn more.');
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
            'opacity-60': cloudNotAllowed
        }"
        :title="selectedModelHasVision ? 'Upload file(s)' : 'Selected model does not have vision capabilities'"
    >
        <label 
            for="file-upload" 
            class="cursor-pointer size-full flex items-center justify-center"
        >
            <BiImageAdd />
        </label>
        <input type="file" id="file-upload" class="hidden" accept="image/*" multiple @change="onChange" @click="onClick" />
    </ChatMessageInputButtonBase>
</template>