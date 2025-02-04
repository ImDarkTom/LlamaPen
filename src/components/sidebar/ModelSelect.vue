<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConfigStore } from '../../stores/config';

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
    padding: 0.5rem;
    background: transparent;
    border-radius: 0.5rem;
    box-sizing: border-box;
    width: fit-content;
    color: var(--txt-2);
    cursor: pointer;

    &:hover {
        background-color: var(--bg-3);
    }
}
</style>
