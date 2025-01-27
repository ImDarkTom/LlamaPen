<script setup lang="ts">
import { onMounted, ref } from 'vue';

const modelsList = ref([]);
const modelSelectRef = ref<HTMLSelectElement | null>(null);

onMounted(() => {
    fetch('http://localhost:11434/api/tags')
        .then(response => response.json())
        .then(response => {
            modelsList.value = response.models.map((item: { model: string }) => item.model);

            if (!localStorage.getItem('selectedModel')) {
                // Set to top model by default
                localStorage.setItem('selectedModel', response.models[0].model);
            }
        });
});

function changeModel() {
    const selectedModel = modelSelectRef.value?.value;

    if (!selectedModel) {
        return;
    }

    localStorage.setItem('selectedModel', selectedModel);
}

</script>

<template>
    <select @change="changeModel" ref="modelSelectRef">
        <option v-for="model in modelsList" :key="model" :value="model">
            {{ model }}
        </option>
    </select>
</template>

<style scoped>
.navbar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: var(--bg-4);
    padding: 1rem;
}
</style>
