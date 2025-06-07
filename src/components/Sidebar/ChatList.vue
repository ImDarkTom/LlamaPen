<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import SidebarChatEntry from './SidebarChatEntry.vue';
import useChatsStore from '@/stores/chatsStore';

const chatsStore = useChatsStore();
const { pinnedChats, hasPinnedChats, unpinnedChatsByRecent } = storeToRefs(chatsStore);

</script>

<template>
	<div class="p-0 m-0 flex-1 overflow-y-auto">
		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="pinnedChatsSection">
			<h3 id="pinnedChatsSection" class="sr-only">Pinned Chats</h3>
			<SidebarChatEntry v-for="chat of pinnedChats" :key="chat.id" :chat="chat" />
		</div>

		<div v-if="hasPinnedChats" class="w-full h-[1px] bg-txt-1/50" role="separator"></div>

		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="unpinnedChatsSection">
			<h3 id="unpinnedChatsSection" class="sr-only">Unpinned Chats</h3>
			<SidebarChatEntry v-for="chat of unpinnedChatsByRecent" :key="chat.id" :chat="chat" />
		</div>
	</div>
</template>