<script setup lang="ts">
function customUrlDialog() {
    const currentUrl = localStorage.getItem('customUrl') || 'http://localhost:11434';
    const customUrl = prompt("Enter a custom URL to use as a Ollama instance, write in the format of an origin i.e. 'http://example.com:8080'. \n\n Leave blank to reset to default (http://localhost:11434): ", currentUrl);

    if (!customUrl || customUrl == "") {
        localStorage.setItem('customUrl', 'http://localhost:11434');
        location.reload();
        return;
    }

    localStorage.setItem('customUrl', customUrl);
    location.reload();
}
</script>

<template>
    <input type="button" value="Custom URL" @click="customUrlDialog">
</template>

<style scoped>
input {
    margin-right: 1rem;
    background-color: var(--bg-2);
    font-style: italic;
    border: 1px solid var(--txt-1);
    border-radius: 0.5rem;
    padding: 0.4rem;
    cursor: pointer;
}
</style>
