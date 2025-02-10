<script setup lang="ts">
import CustomUrlButton from './CustomUrlButton.vue';
import StatusText from './StatusText.vue';


function showGuide() {
    const originUrl = window.location.origin;

    alert(`Ollama does not allow external connections by default, for this app to work you need to add this URL to Ollama's trusted origins and re-launch it. You can do this by running this in command prompt or powershell: \n\n set OLLAMA_ORIGINS=\"${originUrl}\" & ollama serve`);
}
</script>

<template>
    <div class="flex flex-col max-w-full">
        <StatusText />
        <div class="flex flex-row gap-2">
            <input type="button" class="flex-1 border-none px-1 py-0 m-0 box-border rounded-lg h-8 bg-primary-300 cursor-pointer hover:shadow-sm shadow-black hover:bg-primary-200" value="?" @click="showGuide">
            <CustomUrlButton class="flex-1 border-none px-1 py-0 m-0 box-border rounded-lg h-8 bg-primary-300 cursor-pointer hover:shadow-sm shadow-black hover:bg-primary-200" />
        </div>
    </div>
</template>