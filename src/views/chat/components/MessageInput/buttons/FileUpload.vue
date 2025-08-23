<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { useUiStore } from '@/stores/uiStore';
import useUserStore from '@/stores/user';
import { computed } from 'vue';
import { MdOutlineAddPhotoAlternate } from 'vue-icons-plus/md';

const uiStore = useUiStore();
const userStore = useUserStore();
const config = useConfigStore();

defineProps<{
    onChange: (event: Event) => void
}>();

const selectedModelHasVision = computed(() => {
    return uiStore.chat.selectedModelInfo?.capabilities.includes('vision');
});

const apiNotAllowed = computed(() => {
    return config.api.enabled && !userStore.subscription.subscribed;
});

function onClick(e: MouseEvent) {
    if (!selectedModelHasVision.value) {
        e.preventDefault();
        return;
    }

    if (apiNotAllowed.value) {
        alert('Send attachments to API models with LlamaPen API Premium. Visit the Account page to learn more.');
        e.preventDefault();
        return;
    }
}
</script>

<template>
    <div 
        class="aspect-square msg-input-secondary-btn !p-0"
        :class="{ 
            'opacity-50 cursor-not-allowed': !selectedModelHasVision,
            'opacity-60': apiNotAllowed
        }"
        :title="selectedModelHasVision ? 'Upload file(s)' : 'Selected model does not have vision capabilities'"
    >
        <label 
            for="file-upload" 
            class="cursor-pointer size-full flex items-center justify-center"
        >
            <MdOutlineAddPhotoAlternate />
        </label>
        <input type="file" id="file-upload" class="hidden" accept="image/*" multiple @change="onChange" @click="onClick" />
    </div>
</template>