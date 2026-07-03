<script setup lang="ts">
import type { CustomProvider } from '@/stores/useCustomProvidersStore';
import { Label } from 'reka-ui';

const emit = defineEmits<{
    'select-preset': [preset: CustomProvider];
}>();

const presets: Record<string, CustomProvider> = {
    ollama: {
        name: 'Ollama',
        baseURL: import.meta.env.VITE_DEFAULT_OLLAMA ?? 'http://localhost:11434',
        apiKey: 'unusedkey',
        format: 'ollama',
    },
    llamacpp: {
        name: 'llama.cpp',
        baseURL: 'http://127.0.0.1:8080/v1',
        apiKey: 'unusedkey',
        format: 'openai',
    },
    jan: {
        name: 'Jan',
        baseURL: 'http://127.0.0.1:1337',
        apiKey: 'unusedkey',
        format: 'openai',
    },
    vllm: {
        name: 'vLLM',
        baseURL: 'http://localhost:8000/v1',
        apiKey: 'vllm-key',
        format: 'openai',
    },
    lmstudio: {
        name: 'LM Studio',
        baseURL: 'http://localhost:1234/v1',
        apiKey: 'unusedkey',
        format: 'openai',
    },

    openrouter: {
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: '',
        format: 'openai',
    },
    openai: {
        name: 'OpenAI',
        baseURL: 'https://api.openai.com/v1',
        apiKey: '',
        format: 'openai',
    },
    'ollama-cloud': {
        name: 'Ollama Cloud',
        baseURL: 'https://ollama.com',
        apiKey: '',
        format: 'ollama',
    },
    groq: {
        name: 'Groq',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: '',
        format: 'openai',
    },
    together: {
        name: 'Together',
        baseURL: 'https://api.together.ai/v1',
        apiKey: '',
        format: 'openai',
    },
    deepseek: {
        name: 'DeepSeek',
        baseURL: 'https://api.deepseek.com',
        apiKey: '',
        format: 'openai',
    },
};

function onSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const preset = presets[value];

    if (preset) {
        emit('select-preset', preset);
    }
}

const selectedPreset = defineModel<string>('selected-preset');

const id = useId();
</script>

<template>
    <div class="mt-2">
        <Label :for="id">Preset</Label>
        <select
            class="w-full bg-base-800 px-6 py-4 rounded-md outline-none ring ring-inset ring-base-600 focus:ring-base-300"
            :id
            v-model="selectedPreset"
            @change="onSelect">
            <option
                value=""
                disabled>
                Select a preset
            </option>

            <optgroup label="Self-hosted">
                <option value="ollama">Ollama (Local)</option>
                <option value="llamacpp">llama.cpp</option>
                <option value="jan">Jan</option>
                <option value="vllm">vLLM</option>
                <option value="lmstudio">LM Studio</option>
            </optgroup>

            <optgroup label="Cloud">
                <option value="openrouter">OpenRouter [openrouter.ai]</option>
                <option value="openai">OpenAI [api.openai.com]</option>
                <option value="ollama-cloud">Ollama (Cloud) [ollama.com]</option>
                <option value="groq">Groq [api.groq.com]</option>
                <option value="together">Together AI [api.together.ai]</option>
                <option value="deepseek">DeepSeek [api.deepseek.com]</option>
            </optgroup>

            <option value="custom">Custom</option>
        </select>
    </div>
</template>
