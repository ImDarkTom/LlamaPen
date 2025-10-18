<script setup lang="ts">
import useToolsStore from '@/stores/toolsStore';
import { computed } from 'vue';
import { BiError, BiLinkExternal, BiTrash } from 'vue-icons-plus/bi';
import TextInput from './TextInput.vue';
import TextDivider from '@/components/TextDivider/TextDivider.vue';
import { ref } from 'vue';
import ToolRequestOptions from './edit/ToolRequestOptions.vue';
import NumberInput from './NumberInput.vue';

const props = defineProps<{
    tool: string;
}>();

const toolsStore = useToolsStore();

const reqOptionsOpened = ref(false);

const selectedTool = computed<AppTools[string] | null>(() => {
    return toolsStore.tools[props.tool] ?? null;
});

const missingParams = computed(() => {
    if (!selectedTool.value) return;

    return selectedTool.value.params
        .map(item => item.name)
        .filter(paramName => 
            !selectedTool.value?.url.includes(`{{${paramName}}}`) &&
            !selectedTool.value?.requestOptions.body?.includes(`{{${paramName}}}`));
});

function updateEnums(param: AppToolSchema[number], newValue: string) {
    if (!newValue) {
        delete param.enum;
        return;
    };

    const enumsList = newValue.split(',');

    param.enum = enumsList;
}

function deleteParam(paramName: string) {
    if (paramName === '' || confirm(`Are you sure you want to delete the '${paramName}' parameter?`)) {
        toolsStore.tools[props.tool].params = selectedTool.value?.params.filter(param => param.name !== paramName) || [];
    }
}

function addParameter() {
    toolsStore.tools[props.tool].params.push({
        name: '',
        type: 'string',
        description: '',
        enum: []
    });
}

const timeoutValue = computed({
    get: () => selectedTool.value?.timeout ?? 10000, // default or fallback
    set: (value: number) => {
        if (selectedTool.value) {
            selectedTool.value.timeout = value;
        }
    },
});
</script>

<template>
    <div v-if="!selectedTool" class="w-full h-full flex items-center justify-center">
        Invalid tool name.
    </div>
    <div v-else class="overflow-auto flex flex-col md:pr-4">
        <h1 class="text-text font-bold">{{ props.tool }}</h1>
        <div 
            v-if="selectedTool.userHint"
            class="py-2">{{ selectedTool.userHint }}</div>
        <TextDivider text="User-facing" />
        <label class="text-lg mb-2">
            <input type="checkbox" v-model="selectedTool.userConfirmation">
            <span class="ml-2">Require user confirmation?</span>
        </label>
        <TextInput v-model="selectedTool.url" label="Query URL" placeholder="https://example.com/?param={{query}}&other={{param}}" />
        <button
            class="btn-primary w-full p-3 my-2!"
            @click="reqOptionsOpened = !reqOptionsOpened">
            More options
        </button>
        <ToolRequestOptions v-if="reqOptionsOpened" :toolName="props.tool" :selectedTool="selectedTool" />
        <div v-if="missingParams && missingParams.length > 0" class="text-warning">
            <BiError class="inline" />
            <span class="align-middle">Params not found in query URL: </span>
            <ul>
                <li v-for="param in missingParams"><span class="select-none">• </span>{{ `\{\{${param || '<blank>'}\}\}` }}</li>
            </ul>
        </div>
        <TextDivider class="mt-2" text="Model-facing" />
        <div class="flex flex-col gap-2">
            <TextInput 
                v-model="selectedTool.description" 
                label="Description" 
                placeholder="How/when to use the tool (e.g. Search the internet for a query)" />
            <h2>Parameters</h2>
            <div v-for="(param, index) in selectedTool.params" :key="index" class="flex flex-col bg-surface p-2 gap-2 rounded-lg">
                <div class="flex flex-row gap-2">
                    <TextInput v-model="param.name" placeholder="Parameter name (e.g. page)" class="w-full font-medium" />
                    <button 
                        class="bg-danger text-background-light p-2 cursor-pointer aspect-square rounded-md hover hover:saturate-200 transition-quick"
                        @click="deleteParam(param.name)">
                        <BiTrash class="mx-auto" />
                    </button>
                </div>
                <div class="flex flex-row gap-2 w-full">
                    <select class="p-4 tools-input" v-model="param.type">
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="integer">Integer</option>
                    </select>
                    <TextInput v-model="param.description" placeholder="Parameter description (e.g. 'What to search for.')" class="w-full" />
                </div>
                <label>
                    <span>Enums (optional):</span>
                    <input class="p-4 w-full tools-input" type="text"
                        placeholder="Options seperated by commas (e.g. apple,banana,cherry,...)" :value="param.enum"
                        @input="updateEnums(param, ($event.target as HTMLInputElement).value)">
                </label>
            </div>
            <button class="btn-primary text-center p-4" @click="addParameter">
                Add parameter
            </button>
        </div>
        <TextDivider class="mt-2" text="Response" />
        <NumberInput
            v-model="timeoutValue"
            label="Request timeout (ms)"
            placeholder="10000" />
        <h2 class="mt-2">Formatting</h2>
        <p class="mb-2 text-sm">
            If the response comes as JSON, you may choose to format it before returning it to the LLM. If not leaving it blank will return the raw response.
            <a href="https://mustache.github.io/mustache.5.html" target="_blank" class="text-secondary underline w-fit">
                <span class="items-center">Full formatting guide</span>
                <BiLinkExternal class="inline size-4 ml-1" />
            </a>.
        </p>
        <textarea
            class="p-4 min-h-64 tools-input resize-y"
            v-model="selectedTool.responseFormatting"
            :placeholder="`# {{title}}\n{{description}}\n\n## Items:\n{{#items}}\n- {{itemName}}: {{itemPrice}} \n{{/items}}`"></textarea>
        <div class="min-h-48 w-full"></div>
    </div>
</template>