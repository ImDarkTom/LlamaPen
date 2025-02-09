<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConfigStore } from '../../../stores/config';

const config = useConfigStore();

const modelsList = ref<string[]>([]);
const selectedModel = ref<string | null>(localStorage.getItem('selectedModel'));

onMounted(() => {
    fetch(config.apiUrl('/api/tags'))
        .then(response => response.json())
        .then(response => {
            modelsList.value = response.models.map((item: { model: string }) => item.model);

            if (!selectedModel.value || !modelsList.value.includes(selectedModel.value)) {
                selectedModel.value = response.models[0].model;
                changeModel();
            }
        });
});

function changeModel() {
    if (selectedModel.value) {
        localStorage.setItem('selectedModel', selectedModel.value);
    }
}

</script>

<template>
    <select @change="changeModel" v-model="selectedModel"
        class="outline-none border-none p-2 rounded-lg box-border w-fit text-txt-2 cursor-pointer hover:bg-primary-300">
        <option v-for="model in modelsList" :key="model" :value="model">
            {{ model }}
        </option>
    </select>
</template>