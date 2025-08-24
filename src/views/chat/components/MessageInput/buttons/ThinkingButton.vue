<script setup lang="ts">
import { useModelList } from '@/composables/useModelList';
import { computed, watch } from 'vue';
import { BiBrain } from 'vue-icons-plus/bi';

const { selectedModelCapabilities } = useModelList();

defineProps(['modelValue']);
const emits = defineEmits(['update:modelValue']);

const selectedModelCanThink = computed(() => selectedModelCapabilities.value.includes('thinking'));

watch(selectedModelCanThink, () => {
    if (!selectedModelCanThink.value) {
        emits('update:modelValue', false)
    }
});

function toggleCheck(e: Event) {
    if (!selectedModelCanThink.value) return;
    emits('update:modelValue', (e.target as HTMLInputElement).checked);
}
</script>

<template>
    <div 
        class="msg-input-secondary-btn " 
        :class="{ 
            'bg-primary ring-background! text-background!': modelValue,
            'opacity-50': !selectedModelCanThink
        }"
        :title="selectedModelCanThink ? 'Enable thinking' : 'Selected model does not have thinking capabilities.'"
    >
        <label for="thinking-toggle" class="cursor-pointer size-full flex flex-row gap-2 items-center justify-center">
            <BiBrain />
            <span>Think</span>
        </label>
        <input type="checkbox" id="thinking-toggle" class="hidden" :value="modelValue"
            @input="toggleCheck" />
    </div>
</template>