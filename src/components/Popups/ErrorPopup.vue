<script setup lang="ts">
import { BiSolidErrorCircle } from 'vue-icons-plus/bi';
import Popup from './Popup.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { emitter } from '../../mitt';

const messageText = ref<string>('');
const errorText = ref<string>('');
const showing = ref<boolean>(false);

onMounted(() => {
	emitter.on('popup:error', ({message, error}) => {
        messageText.value = message;
		errorText.value = error;

		showing.value = true;
    });
});

onUnmounted(() => {
	emitter.off('popup:error');
});

function hide() {
	showing.value = false;
}

</script>

<template>
	<Popup :showing="showing" @close="hide">
		<template #title>
			<BiSolidErrorCircle class="h-full w-auto" />
			An error has occured
		</template>
		<template #body>
			<div class="h-full flex flex-col">
				<div class="grow">
					{{ messageText }}
				</div>
				<pre class="w-full h-1/2 overflow-auto bg-primary-500 text-txt-1 p-2 mb-2">
					{{ errorText }}
				</pre>
			</div>
		</template>
		<template #buttons>
			<button @click="hide">Close</button>
		</template>
	</Popup>
</template>