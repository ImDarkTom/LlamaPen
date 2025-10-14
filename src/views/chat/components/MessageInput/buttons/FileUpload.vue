<script setup lang="ts">
import { useModelList } from '@/composables/useModelList';
import { useConfigStore } from '@/stores/config';
import useUserStore from '@/stores/user';
import { computed } from 'vue';
import MessageInputButton from './MessageInputButton.vue';
import { BiImageAdd } from 'vue-icons-plus/bi';

const userStore = useUserStore();
const config = useConfigStore();

const { selectedModelCapabilities } = useModelList();

defineProps<{
    onChange: (event: Event) => void
}>();

const selectedModelHasVision = computed(() => {
    return selectedModelCapabilities.value.includes('vision')
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
    <MessageInputButton
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
    </MessageInputButton>
</template>