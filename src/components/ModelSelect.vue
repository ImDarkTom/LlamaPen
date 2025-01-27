<script setup lang="ts">
import { onMounted, ref } from 'vue';

const modelsList = ref([]);
const modelSelectRef = ref<HTMLSelectElement | null>(null);

onMounted(() => {
    fetch(`${localStorage.getItem('customUrl')}/api/tags`)
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
select {
    border: 1px solid var(--txt-1);
    border-radius: 0.5rem;
    padding: 0.5rem;
    background-color: var(--bg-2);
}
</style>
