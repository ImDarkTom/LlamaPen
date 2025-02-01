<script setup lang="ts">
import { onMounted, ref } from 'vue';

const modelsList = ref<string[]>([]);
const selectedModel = ref<string | null>(localStorage.getItem('selectedModel'));


onMounted(() => {
    fetch(`${localStorage.getItem('customUrl')}/api/tags`)
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
    <select @change="changeModel" v-model="selectedModel">
        <option v-for="model in modelsList" :key="model" :value="model">
            {{ model }}
        </option>
    </select>
</template>

<style scoped lang="scss">
select {
    outline: none;
    border: none;
    padding: 0.25rem;
    margin: 0.25rem;
    background-color: var(--bg-4);
    border-radius: 0.5rem;
    overflow: hidden;
    width: calc(16vw - 0.5rem);
    box-sizing: border-box;

    &:hover {
        background-color: var(--bg-3);
    }
}
</style>
