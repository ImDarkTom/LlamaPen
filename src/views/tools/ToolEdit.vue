<script setup lang="ts">
import PrimaryButton from '@/components/Buttons/PrimaryButton.vue';
import useToolsStore from '@/stores/toolsStore';
import { computed } from 'vue';
import { BiError, BiPencil, BiTrash } from 'vue-icons-plus/bi';
import TextInput from './TextInput.vue';
import TextDivider from '@/components/TextDivider/TextDivider.vue';
import router from '@/lib/router';

const props = defineProps<{
    tool: string;
}>();

const toolsStore = useToolsStore();

const selectedTool = computed<AppTools[string] | null>(() => {
    return toolsStore.tools[props.tool] ?? null;
});

function rename() {
    let newToolName = prompt('Rename tool to (lowercase & no spaces): ', props.tool);
    if (!newToolName) return;
    
    newToolName = newToolName
        .toLowerCase()
        .replace(/ /g, '_');

    toolsStore.tools[newToolName] = selectedTool.value!;
    delete toolsStore.tools[props.tool];

    router.push(`/tool/${newToolName}`);
}

const missingParams = computed(() => {
    if (!selectedTool.value) return;

    return selectedTool.value.params
        .map(item => item.name)
        .filter(item => !selectedTool.value?.url.includes(`{{${item}}}`));
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
    if (!confirm(`Are you sure you want to delete the '${paramName ?? '<empty>'}' parameter?`)) return;
    toolsStore.tools[props.tool].params = selectedTool.value?.params.filter(param => param.name !== paramName) || [];
}

function addParameter() {
    toolsStore.tools[props.tool].params.push({
        name: '',
        type: 'string',
        description: '',
        enum: []
    });
}

function deleteTool() {
    if (!confirm(`Are you sure you want to delete the '${props.tool}' tool?`)) return;

    delete toolsStore.tools[props.tool];
    router.push('/tools');
}

</script>

<template>
    <div v-if="!selectedTool" class="w-full h-full flex items-center justify-center">
        Invalid tool name.
    </div>
    <div v-else class="overflow-auto max-h-full">
        <h1 class="text-text font-bold">{{ props.tool }}</h1>
        <div class="flex flex-row overflow-x-auto gap-2">
            <PrimaryButton text="Rename" :icon="BiPencil" :single-line="true" type="button" @click="rename" />
            <PrimaryButton text="Delete" :icon="BiTrash" :single-line="true" :color="'danger'" type="button"
                @click="deleteTool" />
        </div>
        <TextDivider text="User-facing" />
        <TextInput v-model="selectedTool.url" label="Query URL" />
        <div v-if="missingParams && missingParams.length > 0" class="text-warning">
            <BiError class="inline" />
            <span class="align-middle">Params not found in query URL: </span>
            <ul>
                <li v-for="param in missingParams"><span class="select-none">- </span>{{ `\{\{${param}\}\}` }}</li>
            </ul>
        </div>
        <TextDivider text="Model-facing" />
        <div class="flex flex-col gap-2">
            <h2 class="text-text font-semibold">Parameters</h2>
            <div v-for="(param, index) in selectedTool.params" :key="index" class="flex flex-col bg-surface p-2 gap-2">
                <div class="flex flex-row gap-2">
                    <TextInput v-model="param.name" placeholder="Parameter name (e.g. page)" class="w-full" />
                    <button 
                        class="cursor-pointer bg-danger text-background-light px-2 rounded-md hover hover:saturate-200 transition-quick"
                        @click="deleteParam(param.name)">
                        Delete
                    </button>
                </div>
                <div class="flex flex-row gap-2 w-full">
                    <select class="p-2 bg-surface-light rounded-md" v-model="param.type">
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="integer">Integer</option>
                    </select>
                    <TextInput v-model="param.description" placeholder="Parameter description (e.g. 'What to search for.')" class="w-full" />
                </div>
                <label>
                    <span>Enums (optional):</span>
                    <input class="bg-surface-light p-4 rounded-md w-full" type="text"
                        placeholder="Options seperated by commas (e.g. apple,banana,cherry,...)" :value="param.enum"
                        @input="updateEnums(param, ($event.target as HTMLInputElement).value)">
                </label>
            </div>
            <button class="btn-primary text-center p-4" @click="addParameter">
                Add parameter
            </button>
        </div>
    </div>
</template>