<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import useChatsStore from '@/stores/chatsStore';
import TextDivider from '../TextDivider/TextDivider.vue';
import SidebarEntry from './SidebarEntry.vue';

const chatsStore = useChatsStore();
const { pinnedChats, hasPinnedChats, unpinnedChatsByRecent } = storeToRefs(chatsStore);
</script>

<template>
	<div class="grow overflow-y-auto">
		<TextDivider
			v-if="hasPinnedChats"
			text="Pinned" />
		<div class="grow" role="list" aria-labelledby="pinnedChatsSection">
			<h3 id="pinnedChatsSection" class="sr-only">Pinned Chats</h3>
			<SidebarEntry 
				v-for="chat of pinnedChats" 
				:key="chat.id" 
				:chat />
		</div>

		<TextDivider 
			text="Chats" />

		<div class="grow" role="list" aria-labelledby="unpinnedChatsSection">
			<h3 id="unpinnedChatsSection" class="sr-only">Unpinned Chats</h3>
			<SidebarEntry 
				v-for="chat of unpinnedChatsByRecent" 
				:key="chat.id" 
				:chat />
		</div>

		<div v-if="unpinnedChatsByRecent?.length === 0 && !hasPinnedChats" class="flex h-full items-center justify-center">
			No chats yet...
		</div>
	</div>
</template>