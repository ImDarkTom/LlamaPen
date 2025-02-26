<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IpWrite } from 'vue-icons-plus/ip';
import { AiOutlineSearch } from 'vue-icons-plus/ai';
import { useUiStore } from '../../stores/uiStore';
import { TiDocumentText } from 'vue-icons-plus/ti';
import { BsChatLeft } from 'vue-icons-plus/bs';
import { HiSwitchHorizontal } from 'vue-icons-plus/hi';

const router = useRouter();
const uiStore = useUiStore();

const newChat = () => {
    if (uiStore.mode === 'chat') {
        router.push('/');
    } else {
        router.push('/textpad')
    }
}

function search() {
    alert('to be added...');
}
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row p-0 box-border">
            <span class="flex-1 text-2xl font-bold select-none">LlamaPen</span>
            <AiOutlineSearch aria-label="Search"
                class="h-6 w-auto m-auto cursor-pointer ml-2 p-2 box-content rounded-lg hover:bg-primary-300 hover:shadow-xs shadow-black/50"
                @click="search" />
            <IpWrite aria-label="New Chat"
                class="h-6 w-auto m-auto cursor-pointer ml-2 p-2 box-content rounded-lg hover:bg-primary-300 hover:shadow-xs shadow-black/50"
                @click="newChat()" />
        </div>
        <div class="w-full h-12 flex flex-row hover:bg-primary-300 rounded-lg cursor-pointer transition-colors duration-100" @mousedown="uiStore.toggleMode">
            <div class="h-full w-12">
                <BsChatLeft class="size-full p-3 box-border" v-if="uiStore.mode === 'chat'" />
                <TiDocumentText class="size-full p-3 box-border" v-else />
            </div>
            <div class="grow text-lg flex items-center pl-1 select-none">
                <template v-if="uiStore.mode === 'chat'">Chat</template>
                <template v-else>Textpad</template>
            </div>
            <div class="h-full w-12">
                <HiSwitchHorizontal class="size-full p-3 box-border" />
            </div>
        </div>
    </div>
</template>