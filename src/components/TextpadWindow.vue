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

const suggestionText = ref<string | null>(null);

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

	let highlightedText = hljs.highlight(realTextarea.value, {
		language: language.value,
	}).value;

	if (suggestionText.value) {
		highlightedText += `<span class="text-txt-2/75">${suggestionText.value}</span>`;
	} else {
		highlightedText += `<kbd class="text-sm text-txt-2/75 border-[1px] border-txt-2/75 box-border rounded-md p-[1px] ml-2">Tab</kbd>`
	}

	virtualTextarea.value!.innerHTML = highlightedText;
}

function getUpToCurrentLine() {
	return mainTextarea.value!.value.substring(0, mainTextarea.value!.selectionStart);
}

async function handleKeyDown(e: KeyboardEvent) {
	if (e.ctrlKey && e.key === "s") {
		e.preventDefault();
		save();
	}

	if (e.key === "Tab") {
		e.preventDefault();

		if (suggestionText.value) {
			mainTextarea.value?.focus();

			// maybe later: https://developer.mozilla.org/en-US/docs/Web/API/InputEvent
			document.execCommand('insertText', false, suggestionText.value);
			suggestionText.value = "";

			updateVirtualTextArea();
			save();
			return;
		}

		console.log("✨ Generating text suggestion...");

		const currentValue = getUpToCurrentLine();

		suggestionText.value = await allTextpadsStore.generateAutocompletion(currentValue);
		updateVirtualTextArea();
	} else {
		suggestionText.value = "";
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

function handleScroll() {
	if (mainTextarea.value && virtualTextarea.value) {
		virtualTextarea.value.scrollTop = mainTextarea.value.scrollTop;
		virtualTextarea.value.scrollLeft = mainTextarea.value.scrollLeft;
	}
}
</script>

<template>
	<div class="w-full h-full flex flex-col p-2 box-border">
		<div class="pl-14 h-14 flex flex-row gap-1 bg-primary-400 mb-2 p-1 rounded-lg box-border">
			<select @change="handleChangeLanguage" v-model="language"
				class="h-full hover:bg-primary-500 p-2 rounded-lg text-txt-2 focus:text-txt-1 cursor-pointer">
				<option value="plaintext">Plaintext</option>
				<option value="html">HTML</option>
				<option value="js">JavaScript</option>
			</select>
			<ModelSelect direction="down" />
		</div>
		<div class="grow size-full p-4 dot-bg rounded-lg border-[1px] border-txt-2/50 shadow-md shadow-black group
				bg-radial from-txt-2/25 via-primary-600/75 via-[2px] to-primary-600/75 bg-[length:2rem_2rem] bg-[position:-1rem_-1rem]">
			<div class="relative size-full">
				<pre ref="virtualTextarea"
					class="!text-base !font-mono absolute top-0 left-0 size-full !leading-4 outline-0 border-none whitespace-pre-wrap break-words p-0 m-0 bg-transparent overflow-y-auto"></pre>
				<textarea ref="mainTextarea"
					class="!text-base !font-mono absolute top-0 left-0 size-full !leading-4 outline-0 border-none whitespace-pre-wrap p-0 m-0 text-transparent bg-transparent resize-none caret-txt-1 z-2"
					@keydown="handleKeyDown" @input="handleInput" @scroll="handleScroll" spellcheck="false"></textarea>
			</div>
		</div>
	</div>
</template>