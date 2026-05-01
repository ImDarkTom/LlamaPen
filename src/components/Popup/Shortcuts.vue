<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { emitter } from '../../lib/mitt';

const showing = ref<boolean>(false);

onMounted(() => {
	emitter.on('shortcutsPopup', () => {
		showing.value = true;
	});
});

onUnmounted(() => {
	emitter.off('shortcutsPopup');
});

function hide() {
	showing.value = false;
}

</script>


<template>
	<PopupBase :showing @close="hide">
		<template #title>
			Keyboard shortcuts
		</template>
		<template #body>
			<div class="flex flex-col w-full h-full box-border overflow-auto">
				<h2 class=" font-semibold pb-2 text-base-100">Interface</h2>
				<ShortcutsPageDisplay label="Toggle sidebar" shortcut="ctrl shift s" />
				<ShortcutsPageDisplay label="Open model selector" shortcut="ctrl shift m" />
				<ShortcutsPageDisplay label="Search chats" shortcut="ctrl k" />
				<h2 class="font-semibold pb-2 text-base-100">Chat</h2>
				<ShortcutsPageDisplay label="New chat" shortcut="ctrl shift o" />
				<ShortcutsPageDisplay label="Focus chat input" shortcut="shift esc" />
				<ShortcutsPageDisplay label="Pin chat" shortcut="shift alt p" />
				<ShortcutsPageDisplay label="Delete chat" shortcut="ctrl shift ⌫" />
			</div>
		</template>
		<template #buttons>
			<button @click="hide">Close</button>
		</template>
	</PopupBase>
</template>