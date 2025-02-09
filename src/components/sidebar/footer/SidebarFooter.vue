<script setup lang="ts">
import CustomUrlButton from './CustomUrlButton.vue';
import StatusText from './StatusText.vue';


function showGuide() {
    const originUrl = window.location.origin;

    alert(`Ollama does not allow external connections by default, for this app to work you need to add this URL to Ollama's trusted origins and re-launch it. You can do this by running this in command prompt or powershell: \n\n set OLLAMA_ORIGINS=\"${originUrl}\" & ollama serve`);
}
</script>

<template>
    <div class="sidebar-options">
        <StatusText />
        <div class="buttons">
            <input type="button" class="button" value="?" @click="showGuide">
            <CustomUrlButton class="button" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.sidebar-options {
    display: flex;
    flex-direction: column;
    max-width: 100%;

    .buttons {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;

        .button {
            flex: 1;
            border: none;
            padding: 0.25rem 0;
            margin: 0;
            box-sizing: border-box;
            border-radius: 0.5rem;
            height: 2rem;
            background-color: var(--bg-3);
            cursor: pointer;

            &:hover {
                box-shadow: 0px 2px 5px -2px rgba(0, 0, 0, 0.5);
                background-color: var(--bg-4);
            }
        }
    }
}
</style>