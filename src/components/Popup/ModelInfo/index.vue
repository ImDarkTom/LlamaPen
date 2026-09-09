<script setup lang="ts">
import ExternalLink from '@/components/ToolsPage/ExternalLink.vue';
import { useProviderManager, type ModelInfo, type ModelParameters } from '@/composables/useProviderManager';
import { emitter } from '@/lib/mitt';
import { useModelSelect } from '@/stores/useModelSelect';
import { onMounted, onUnmounted, ref } from 'vue';
import { BiBrain, BiFile, BiRuler, BiTime } from 'vue-icons-plus/bi';

const isShowing = ref(false);
const model = ref<ModelInfo | null>(null);

onMounted(() => {
    emitter.on('showModelInfo', onShowModelInfo);
});

onUnmounted(() => {
    emitter.off('showModelInfo', onShowModelInfo);
});

function onShowModelInfo(passedModelIndo: ModelInfo) {
    model.value = passedModelIndo;
    isShowing.value = true;
}

function parseBool(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return 'Unknown';
    return value ? 'Yes' : 'No';
}

const modelParameterDescriptions: Record<ModelParameters, string> = {
    max_tokens: 'Maximum number of tokens the model is allowed to generate in the response.',
    reasoning: 'If the modelcan internally reason before producing a final answer.',
    include_reasoning:
        "Whether to return the model's reasoning/thinking tokens in the response, rather than just the final output.",
    tool_choice: 'Specifies how the model should use tools: none, auto, required, or a forced specific tool.',
    tools: 'List of tool/function definitions the model can call, including their names, descriptions, and input schemas.',
    temperature:
        'Controls randomness of sampling; higher values produce more varied output, lower values make it more deterministic.',
    stop: 'One or more sequences that, when generated, cause the model to stop producing further tokens.',
    seed: 'Sets a fixed random seed to make sampling more deterministic/reproducible across requests.',
    top_p: 'Nucleus sampling threshold; only tokens within the top cumulative probability mass p are considered.',
    presence_penalty:
        'Penalizes tokens that have already appeared at all, encouraging the model to introduce new topics/words.',
    frequency_penalty: "Penalizes tokens proportionally to how often they've already appeared, reducing repetition.",
    repetition_penalty:
        'Multiplicative penalty applied to previously generated tokens to discourage verbatim repetition.',
    top_k: 'Restricts sampling to only the k most likely next tokens at each step.',
    min_p: 'Sets a minimum probability threshold (relative to the top token) a token must meet to be eligible for sampling.',
};

const { setModel } = useModelSelect();
const { getSelectedModel } = useProviderManager();

const isCurrentlySelectedModel = computed(() => {
    if (!model.value) return false;
    return getSelectedModel().id === model.value.info.id;
});
</script>

<template>
    <PopupBase
        v-model:showing="isShowing"
        popup-size="large"
        :full-height="true"
        :close-button="true"
        :dismissable="true">
        <template #title> Model Info </template>
        <template #body>
            <div v-if="!model">No model to show info for.</div>
            <article
                v-else
                class="flex h-full min-h-0 flex-row">
                <div class="flex flex-col border-r border-base-500 pr-6 max-w-xs">
                    <h1 class="font-medium text-lg! m-0!">{{ model.app.displayName }}</h1>
                    <span class="text-sm font-mono text-base-300 my-1">{{ model.info.id }}</span>
                    <ExternalLink
                        v-if="model.info.external_link"
                        class="text-xs font-semibold wrap-anywhere"
                        :href="model.info.external_link">
                        {{ model.info.external_link }}
                    </ExternalLink>
                    <span
                        v-else
                        class="text-sm font-semibold text-base-300"
                        >No external link available.</span
                    >

                    <p
                        class="text-sm my-4"
                        :class="{
                            'text-base-300': !model.info.description,
                        }">
                        {{ model.info.description ?? 'No description available.' }}
                    </p>

                    <div class="flex flex-row justify-between">
                        <span class="text-base-300 text-sm mr-2">
                            <BiTime class="inline size-4" />
                            Created
                        </span>

                        <span class="text-sm font-medium">{{
                            model.info.created === null ? 'Unknown' : new Date(model.info.created).toLocaleDateString()
                        }}</span>
                    </div>

                    <div class="flex flex-row justify-between">
                        <span class="text-base-300 text-sm mr-2">
                            <BiFile class="inline size-4" />
                            Knowledge Cutoff
                        </span>

                        <span class="text-sm font-medium">{{
                            model.info.knowledge_cutoff === null
                                ? 'Unknown'
                                : new Date(model.info.knowledge_cutoff).toLocaleDateString()
                        }}</span>
                    </div>

                    <div class="flex flex-row justify-between">
                        <span class="text-base-300 text-sm mr-2">
                            <BiRuler class="inline size-4" />
                            Context Length
                        </span>

                        <span class="text-sm font-medium">{{
                            model.info.context_length === null ? 'Unknown' : model.info.context_length.toLocaleString()
                        }}</span>
                    </div>

                    <div
                        v-if="model.info.top_provider"
                        class="bg-base-600 rounded-sm p-2 mt-4">
                        <span class="font-semibold">Top Provider</span>

                        <div class="flex flex-row justify-between">
                            <span class="text-base-300 text-sm mr-2"> Context Length </span>

                            <span class="text-sm font-medium">{{
                                model.info.top_provider.context_length === null
                                    ? 'Unknown'
                                    : model.info.top_provider.context_length.toLocaleString()
                            }}</span>
                        </div>

                        <div class="flex flex-row justify-between">
                            <span class="text-base-300 text-sm mr-2"> Moderated </span>

                            <span class="text-sm font-medium">{{
                                model.info.top_provider.is_moderated === null
                                    ? 'Unknown'
                                    : model.info.top_provider.is_moderated
                                      ? 'Yes'
                                      : 'No'
                            }}</span>
                        </div>

                        <div class="flex flex-row justify-between">
                            <span class="text-base-300 text-sm mr-2"> Max completion tokens </span>

                            <span class="text-sm font-medium">{{
                                model.info.top_provider.max_completion_tokens === null
                                    ? 'Unknown'
                                    : model.info.top_provider.max_completion_tokens.toLocaleString()
                            }}</span>
                        </div>
                    </div>

                    <div
                        v-if="model.info.pricing"
                        class="bg-base-600 rounded-sm p-2 my-4">
                        <span class="font-semibold">Pricing</span>

                        <div class="flex flex-row justify-between">
                            <span class="text-base-300 text-sm mr-2"> Prompt </span>

                            <span class="text-sm font-medium"
                                >${{ model.info.pricing.prompt * 1_000_000 }} / 1m tokens</span
                            >
                        </div>

                        <div class="flex flex-row justify-between">
                            <span class="text-base-300 text-sm mr-2"> Completion </span>

                            <span class="text-sm font-medium"
                                >${{ model.info.pricing.completion * 1_000_000 }} / 1m tokens</span
                            >
                        </div>
                    </div>

                    <ButtonPrimary
                        class="p-2"
                        :text="isCurrentlySelectedModel ? 'Selected' : 'Select Model'"
                        :disabled="isCurrentlySelectedModel"
                        @click="setModel(model.info.id)" />
                </div>

                <div class="flex min-h-0 w-1/2 flex-row gap-3 pl-6 grow">
                    <div class="flex flex-col max-w-xs">
                        <span class="font-medium">Architecture</span>
                        <span class="text-sm font-medium my-1 text-base-300">Input Modalities</span>
                        <div class="inline-flex gap-2">
                            <div
                                v-for="modality in model.info.architecture.input_modalities"
                                class="capitalize bg-base-600 p-1 px-3 rounded-sm text-xs font-medium"
                                :key="modality">
                                {{ modality }}
                            </div>
                        </div>

                        <span class="text-sm font-medium my-1 text-base-300">Output Modalities</span>
                        <div class="inline-flex gap-2">
                            <div
                                v-for="modality in model.info.architecture.output_modalities"
                                class="capitalize bg-base-600 p-1 px-3 rounded-sm text-xs font-medium"
                                :key="modality">
                                {{ modality }}
                            </div>
                        </div>

                        <div
                            v-if="model.info.reasoning"
                            class="bg-base-600 rounded-sm p-2 mt-4">
                            <span class="font-semibold">
                                <BiBrain class="inline size-4" />
                                Reasoning
                            </span>

                            <div class="flex flex-row justify-between">
                                <span class="text-base-300 text-sm mr-2"> Enabled by default </span>

                                <span class="text-sm font-medium">{{
                                    parseBool(model.info.reasoning.default_enabled)
                                }}</span>
                            </div>

                            <div class="flex flex-row justify-between">
                                <span class="text-base-300 text-sm mr-2"> Mandatory </span>

                                <span class="text-sm font-medium">{{ parseBool(model.info.reasoning.mandatory) }}</span>
                            </div>

                            <div class="flex flex-row justify-between">
                                <span class="text-base-300 text-sm mr-2"> Supported Efforts </span>

                                <span class="text-sm font-medium capitalize">{{
                                    model.info.reasoning.supported_efforts?.join(', ') ?? 'N/A'
                                }}</span>
                            </div>

                            <div class="flex flex-row justify-between">
                                <span class="text-base-300 text-sm mr-2"> Default Effort </span>

                                <span class="text-sm font-medium capitalize">{{
                                    model.info.reasoning.default_effort ?? 'N/A'
                                }}</span>
                            </div>

                            <div class="flex flex-row justify-between">
                                <span class="text-base-300 text-sm mr-2"> Supports Max Tokens </span>

                                <span class="text-sm font-medium">{{
                                    model.info.reasoning.supports_max_tokens ? 'Yes' : 'No'
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex min-h-0 flex-1 flex-col">
                        <span class="font-medium mb-2">Supported Parameters</span>
                        <div class="min-h-0 flex-1 overflow-y-auto rounded-lg border border-base-500">
                            <table class="w-full">
                                <thead>
                                    <tr>
                                        <th class="text-left p-1 border border-base-500">Parameter</th>
                                        <th class="text-left p-1 border border-base-500">Default Value</th>
                                        <th class="text-left p-1 border border-base-500">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="parameter in model.info.supported_parameters"
                                        :key="parameter">
                                        <td class="p-1 border border-base-500">
                                            <div
                                                class="text-sm font-medium font-monos py-1 px-2 w-fit rounded-lg bg-base-600">
                                                {{ parameter }}
                                            </div>
                                        </td>
                                        <td
                                            class="text-sm font-medium border border-base-500"
                                            :class="{
                                                'text-base-300': !model.info.default_parameters[parameter],
                                            }">
                                            {{ model.info.default_parameters[parameter] ?? 'None' }}
                                        </td>
                                        <td
                                            class="text-xs font-medium border border-base-500 p-0.5"
                                            :class="{
                                                'text-base-300': !modelParameterDescriptions[parameter],
                                            }">
                                            {{ modelParameterDescriptions[parameter] ?? 'No description available.' }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </article>
        </template>
    </PopupBase>
</template>
