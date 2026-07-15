<script setup lang="ts">
import type { CustomProvider } from '@/stores/useCustomProvidersStore';
import {
    Label,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectLabel,
    SelectPortal,
    SelectRoot,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    SelectViewport,
} from 'reka-ui';
import { BiCheck, BiChevronDown, BiChevronUp, BiKey } from 'vue-icons-plus/bi';

const emit = defineEmits<{
    'select-preset': [preset: CustomProvider];
}>();

const presets: (
    | {
          type: 'custom';
      }
    | {
          type: 'group';
          label: string;
          items: Record<string, CustomProvider>;
      }
)[] = [
    {
        type: 'group',
        label: 'Self-hosted',
        items: {
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
        },
    },
    {
        type: 'group',
        label: 'Cloud',
        items: {
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
        },
    },
    {
        type: 'custom',
    },
];

const presetById: Record<string, CustomProvider> = Object.fromEntries(
    presets.filter((entry) => entry.type === 'group').flatMap((entry) => Object.entries(entry.items)),
);

function onSelect(value: string) {
    const preset = presetById[value];

    if (preset) {
        emit('select-preset', preset);
    }
}

function getPresetLabel(value: unknown) {
    if (value === 'custom') {
        return 'Custom';
    }

    return typeof value === 'string' ? (presetById[value]?.name ?? 'Select a preset...') : 'Select a preset...';
}

const selectedPreset = defineModel<string>('selected-preset');

const id = useId();
</script>

<template>
    <div class="mt-2 flex flex-col">
        <Label :for="id">Preset</Label>
        <SelectRoot
            v-model="selectedPreset"
            :id
            @update:model-value="onSelect">
            <SelectTrigger
                aria-label="Select preset"
                class="inline-flex items-center justify-between w-full text-start bg-base-800 px-6 py-4 rounded-md outline-none ring ring-inset ring-base-600 focus:ring-base-300 data-placeholder:text-base-300 text-base-200">
                <SelectValue v-slot="{ modelValue }">
                    {{ getPresetLabel(modelValue) }}
                </SelectValue>
                <BiChevronDown />
            </SelectTrigger>

            <SelectPortal>
                <SelectContent
                    class="bg-base-600 z-200 p-1 rounded-lg shadow-elevation-4 w-(--reka-select-trigger-width) max-h-(--reka-select-content-available-height)"
                    position="popper"
                    side="bottom"
                    :side-offset="4"
                    :collision-padding="32">
                    <SelectScrollUpButton class="w-full flex items-center justify-center">
                        <BiChevronUp />
                    </SelectScrollUpButton>
                    <SelectViewport>
                        <template
                            v-for="(item, index) in presets"
                            :key="index">
                            <SelectGroup
                                v-if="item.type === 'group'"
                                class="flex flex-col gap-1">
                                <SelectSeparator
                                    v-if="index !== 0"
                                    class="h-px bg-base-300 mt-2" />
                                <SelectLabel class="text-base-200 text-sm ml-2 mt-2">{{ item.label }}</SelectLabel>

                                <template
                                    v-for="[id, preset] in Object.entries(item.items)"
                                    :key="id">
                                    <SelectItem
                                        class="inline-flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-base-500"
                                        :value="id">
                                        <div class="size-4">
                                            <SelectItemIndicator>
                                                <BiCheck class="size-4" />
                                            </SelectItemIndicator>
                                        </div>
                                        <div class="flex flex-col">
                                            <SelectItemText class="font-medium text-base-100">{{
                                                preset.name
                                            }}</SelectItemText>
                                            <div class="inline-flex gap-3 items-center">
                                                <p class="text-xs text-base-300">{{ preset.baseURL }}</p>
                                                <Tooltip
                                                    v-if="preset.apiKey === ''"
                                                    text="Requires API Key"
                                                    size="small">
                                                    <BiKey class="size-4" />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </template>
                            </SelectGroup>

                            <template v-else-if="item.type === 'custom'">
                                <SelectSeparator class="bg-base-300 h-px my-2" />
                                <SelectItem
                                    class="w-full inline-flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-base-500"
                                    value="custom">
                                    <div class="size-4">
                                        <SelectItemIndicator>
                                            <BiCheck class="size-4" />
                                        </SelectItemIndicator>
                                    </div>
                                    <div class="flex flex-col">
                                        <SelectItemText class="font-medium text-base-100"> Custom </SelectItemText>
                                    </div>
                                </SelectItem>
                            </template>
                        </template>
                    </SelectViewport>
                    <SelectScrollDownButton class="w-full flex items-center justify-center">
                        <BiChevronDown />
                    </SelectScrollDownButton>
                </SelectContent>
            </SelectPortal>
        </SelectRoot>
    </div>
</template>
