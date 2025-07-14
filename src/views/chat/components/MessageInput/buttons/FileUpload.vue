<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore';
import { computed } from 'vue';
import { MdOutlineAddPhotoAlternate } from 'vue-icons-plus/md';

const uiStore = useUiStore();

defineProps<{
    onChange: (event: Event) => void
}>();

const selectedModelHasVision = computed(() => {
    return uiStore.chat.selectedModelInfo?.capabilities.includes('vision');
});

function onClick(e: MouseEvent) {
    if (!selectedModelHasVision.value) {
        e.preventDefault();
        return;
    }
}
</script>

<template>
    <div 
        class="aspect-square msg-input-secondary-btn !p-0"
        :class="{ 'opacity-50': !selectedModelHasVision }"
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