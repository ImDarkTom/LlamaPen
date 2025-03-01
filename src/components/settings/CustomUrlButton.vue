<script setup lang="ts">
import { useConfigStore } from '../../stores/config';

const config = useConfigStore();

function customUrlDialog() {
    const currentUrl = config.ollamaUrl;
    const customUrl = prompt("Enter a custom URL to use as a Ollama instance, write in the format of an origin i.e. 'http://example.com:8080'. \n\n Leave blank to reset to default (http://localhost:11434): ", currentUrl);

    if (customUrl === currentUrl) {
        return;
    }

    if (!customUrl || customUrl == "") {
        config.setOllamaUrl('http://localhost:11434')
        return;
    }

    config.setOllamaUrl(customUrl);
    location.reload();
}
</script>

<template>
    <input type="button" value="Set custom Ollama URL" @click="customUrlDialog"
        class="bg-primary-300 p-4 w-min rounded-lg cursor-pointer hover:ring hover:shadow-sm shadow-black/50 !text-txt-1">
</template>