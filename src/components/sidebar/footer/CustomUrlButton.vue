<script setup lang="ts">
import apiClient from '../../../utils/apiClient';

function setApiUrlDialog() {
	const defaultUrl = 'http://localhost:11434';
	const currentUrl = apiClient.getBaseUrl;

	let customUrl = prompt("Enter a custom URL to use as a Ollama instance, write in the format of an origin i.e. 'http://example.com:8080'. \n\n Leave blank to reset to default (http://localhost:11434): ", currentUrl);

	// User pressed cancel
	if (customUrl === null) {
		return;
	}

	if (customUrl === '') {
		customUrl = defaultUrl;
	}

	localStorage.setItem('apiUrl', customUrl);
	apiClient.setBaseUrl(customUrl);

	if (customUrl === currentUrl) {
		return;
	}

	location.reload();
}
</script>

<template>
	<input type="button" value="🔗" @mousedown="setApiUrlDialog">
</template>