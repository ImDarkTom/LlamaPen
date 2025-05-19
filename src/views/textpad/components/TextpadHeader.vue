<script setup lang="ts">
import ModelSelect from '@/components/ModelSelect/ModelSelect.vue';

const emit = defineEmits(['save']);
</script>

<template>
    <div class="pl-14 h-14 flex flex-row gap-1 bg-primary-400 mb-2 p-1 rounded-lg box-border">
        <ModelSelect direction="down" />
        <button aria-label="Save" class="bg-primary-300 aspect-square rounded-lg cursor-pointer ring-1 ring-txt-2/50" @click="emit('save')">💾</button>
    </div>
</template>