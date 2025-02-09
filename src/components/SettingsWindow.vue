<script setup lang="ts">
import OllamaUrl from './settings/OllamaUrl.vue';

</script>

<template>
    <div class="settings-window">
        <h1>Settings</h1>
        <h2>Ollama</h2>
        <h3>Ollama URL</h3>
        <OllamaUrl />
    </div>
</template>

<style lang="scss">
.settings-window {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1rem 3rem;
    box-sizing: border-box;

    .setting-wrapper {
        input {
            background-color: var(--bg-4);
            border: none;
            padding: 0.5rem;
            border-radius: 0.5rem;
            color: var(--txt-1);
        }
    }
}
</style>
