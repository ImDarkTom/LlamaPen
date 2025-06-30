<script setup lang="ts">
import { AiOutlinePlus } from 'vue-icons-plus/ai';

defineProps<{
    onChange: (event: Event) => void
}>();
</script>

<template>
    <div class="aspect-square msg-input-secondary-btn !p-0"
        title="Upload file(s)">
        <label for="file-upload" class="cursor-pointer size-full flex items-center justify-center">
            <AiOutlinePlus />
        </label>
        <input type="file" id="file-upload" class="hidden" accept="image/*" multiple @change="onChange" />
    </div>
</template>