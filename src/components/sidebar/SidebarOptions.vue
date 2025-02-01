<script setup lang="ts">
import CustomUrlButton from './CustomUrlButton.vue';
import ModelSelect from './ModelSelect.vue';
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
            <input type="button" value="?" @click="showGuide">
            <CustomUrlButton />
        </div>
        <ModelSelect />
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

        * {
            flex: 1;
            border: none;
            margin: 0.25rem;
            box-sizing: border-box;
            border-radius: 0.5rem;
            height: 2rem;
            background-color: var(--bg-3);
            cursor: pointer;

            &:hover {
                @include mixin.shadow-low;
                background-color: var(--bg-4);
            }
        }
    }
}
</style>