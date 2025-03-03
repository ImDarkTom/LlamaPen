<script setup lang="ts">
import { BiSolidErrorCircle } from 'vue-icons-plus/bi';
import Popup from './Popup.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { emitter } from '../../mitt';
import { useConfigStore } from '../../stores/config';
import { useRouter } from 'vue-router';

const config = useConfigStore();

const router = useRouter();

const dnsaCheckbox = ref<HTMLInputElement | null>(null);

const showing = ref<boolean>(false);

onMounted(() => {
	emitter.on('popup:ollamanotconnected', () => {
        const shouldHide = localStorage.getItem('hideConnectionWarning') || "false";

		if (shouldHide === "true") {
			return;
		}

        showing.value = true;
    });
});

onUnmounted(() => {
	emitter.off('popup:ollamanotconnected');
});

function handleDNSAToggleCheck() {
	if (dnsaCheckbox.value?.checked) {
		localStorage.setItem('hideConnectionWarning', "true");
	}
}

function openGuide() {
	handleDNSAToggleCheck();
	showing.value = false;
	router.push('/guide');
}

function hide() {
	handleDNSAToggleCheck();
	showing.value = false;
}

</script>


<template>
	<Popup :showing="showing" @close="hide">
		<template #title>
			<BiSolidErrorCircle class="h-full w-auto" />
			Ollama not connected
		</template>
		<template #body>
			<div class="h-full flex flex-col">
				<div class="grow">
					Unable to connect to Ollama at <i>'{{config.ollamaUrl}}'</i>. Ensure Ollama is running and accepts connection requests from this site. 
					For a guide on how to configure Ollama to accept requests from this page, press ''<i>More info</i>'
					or the &nbsp;<kbd class="bg-primary-400 px-2 rounded-lg ring">?</kbd>&nbsp; icon in the bottom left of the sidebar;
				</div>
				<div class="pb-4 flex flex-row items-center gap-2">
					<input id="notconnected-dnsa" type="checkbox" ref="dnsaCheckbox" class="accent-txt-2">
					<label for="notconnected-dnsa">Do not show again</label>
				</div>
			</div>
		</template>
		<template #buttons>
			<button @click="openGuide">More info</button>
			<button @click="hide">Close</button>
		</template>
	</Popup>
</template>