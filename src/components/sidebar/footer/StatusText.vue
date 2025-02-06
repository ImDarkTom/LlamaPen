<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConfigStore } from '../../../stores/config';

const config = useConfigStore();

const statusMessageText = ref("Waiting for Ollama...");
const statusMessageElem = ref<HTMLElement | null>(null);
const connectedToOllama = ref<boolean | null>(null);

onMounted(() => {
    fetch(config.apiUrl('/'))
        .then(response => response.text())
        .then(response => {
            statusMessageText.value = response;
            connectedToOllama.value = true;
        })
        .catch((error) => {
            statusMessageText.value = error;
            connectedToOllama.value = false;
        })
});

</script>

<template>
    <div class="status-text-wrapper">
        <span class="status-text" :class="{ 'ok': connectedToOllama === true, 'fail': connectedToOllama === false }">
            Ollama status:
            <span ref="statusMessageElem">{{ statusMessageText }}</span>
        </span>
    </div>
</template>

<style scoped lang="scss">
.status-text-wrapper {
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.5rem 0;

    .status-text {
        color: hsl(60, 100%, 75%);

        &.ok {
            color: hsl(120, 100%, 75%);
        }

        &.fail {
            color: hsl(0, 100%, 75%);
        }
    }
}
</style>
