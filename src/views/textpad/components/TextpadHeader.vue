<script setup lang="ts">
import ModelSelect from '@/components/ModelSelect/ModelSelect.vue';

function handleChangeLanguage(e: Event) {
    const newValue = (e.target as HTMLSelectElement).value;

    emit('update:language', newValue);
}

defineProps<{
    updateVirtualTextArea: () => void;
}>();

const emit = defineEmits(['update:language']);

</script>

<template>
    <div class="pl-14 h-14 flex flex-row gap-1 bg-primary-400 mb-2 p-1 rounded-lg box-border">
        <select @change="handleChangeLanguage"
            class="h-full hover:bg-primary-500 p-2 rounded-lg text-txt-2 focus:text-txt-1 cursor-pointer">
            <option value="plaintext">Plaintext</option>
            <option value="html">HTML</option>
            <option value="js">JavaScript</option>
        </select>
        <ModelSelect direction="down" />
    </div>
</template>