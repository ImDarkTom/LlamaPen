<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useTextpadStore } from '../stores/allTextpads';
import ModelSelect from './chat/messageInput/ModelSelect.vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '../stores/uiStore';
import hljs from 'highlight.js';

const allTextpadsStore = useTextpadStore();
const uiStore = useUiStore();

const route = useRoute();

const language = ref<string>('plaintext');

const mainTextarea = ref<HTMLTextAreaElement | null>(null);
const virtualTextarea = ref<HTMLElement | null>(null);

watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) {
        loadTextpad();
    }
});

function loadTextpad() {
	allTextpadsStore.setOpened(route.params.id as string);

	if (!mainTextarea.value) {
		return;
	}

	language.value = allTextpadsStore.openedTextpad?.language || "plaintext";

	mainTextarea.value.value = allTextpadsStore.openedTextpad?.content || '';
	updateVirtualTextArea();
	mainTextarea.value.focus();

	uiStore.setLastOpenedTextpad(route.params.id as string);
}

onMounted(() => {
	loadTextpad();
});

function save() {
	if (!mainTextarea.value) {
		return;
	}

	allTextpadsStore.write(mainTextarea.value.value);
}

async function updateVirtualTextArea() {
	const realTextarea = mainTextarea.value;

	if (!realTextarea) return;

	virtualTextarea.value!.innerHTML = hljs.highlight(realTextarea.value, {
		language: language.value,
	}).value;
}

async function handleKeyDown(e: KeyboardEvent) {
	if (e.ctrlKey && e.key === "s") {
		e.preventDefault();
		save();
	}
}

function handleInput() {
	updateVirtualTextArea()
}

function handleChangeLanguage(e: Event) {
	const newValue = (e.target as HTMLSelectElement).value;

	allTextpadsStore.setLanguage(newValue);

	updateVirtualTextArea();
}
</script>

<template>
    <div class="w-full h-full flex flex-col p-2 box-border">
        <div class="pl-14 h-14 flex flex-row gap-1 bg-primary-400 mb-2 p-1 rounded-lg box-border">
			<select @change="handleChangeLanguage" v-model="language" class="h-full hover:bg-primary-500 p-2 rounded-lg text-txt-2 	focus:text-txt-1 cursor-pointer">
				<option value="plaintext">Plaintext</option>
				<option value="html">HTML</option>
				<option value="js">JavaScript</option>
			</select>
			<ModelSelect direction="down" />
		</div>
		<div class="grow size-full p-4 dot-bg rounded-lg border-[1px] border-txt-2/50 shadow-md shadow-black group
				bg-radial from-txt-2/25 via-primary-500 via-[2px] to-primary-500 bg-[length:2rem_2rem] bg-[position:-1rem_-1rem]">
			<div class="relative size-full">
				<!-- no clue why we need py-1 to have it align, try properly fix it later -->
				<pre ref="virtualTextarea" class="text-sm font-mono absolute top-0 left-0 size-full !leading-none outline-0 border-none whitespace-pre p-0 m-0 bg-transparent"></pre>
				<textarea ref="mainTextarea" class="text-sm !font-mono absolute top-0 left-0 size-full !leading-none outline-0 border-none whitespace-pre p-0 m-0 text-transparent bg-transparent resize-none caret-txt-1 z-2"
					@keydown="handleKeyDown" 
					@input="handleInput"
					spellcheck="false"
				></textarea>
			</div>
		</div>
    </div>
</template>