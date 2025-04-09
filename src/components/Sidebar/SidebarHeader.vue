<script setup lang="ts">
import { useRouter } from 'vue-router';
import { AiOutlineSearch } from 'vue-icons-plus/ai';
import { useUiStore } from '../../stores/uiStore';
import { BsChatLeft } from 'vue-icons-plus/bs';
import { HiSwitchHorizontal } from 'vue-icons-plus/hi';
import { PiNotepad } from 'vue-icons-plus/pi';

const router = useRouter();
const uiStore = useUiStore();

// const newChat = () => {
//     if (uiStore.mode === 'chat') {
//         router.push('/');
//     } else {
//         router.push('/textpad')
//     }
// }

function search() {
    alert('to be added...');
}

function toggleMode() {
    uiStore.toggleMode();

    if (uiStore.mode === 'chat') {
        if (!uiStore.lastOpenedChatId) {
            router.push('/');
        } else {
            router.push(`/chat/${uiStore.lastOpenedChatId}`);
        }
    } else {
        if (!uiStore.lastOpenedTextpadId) {
            router.push('/textpad');
        } else {
            router.push(`/textpad/${uiStore.lastOpenedTextpadId}`);
        }
    }
}
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row p-0 box-border justify-between items-center pb-2">
            <div class="size-10 p-1"></div><!-- sidebar toggle space holder -->
            <RouterLink to="/" class="max-h-10 w-1/2 flex justify-center items-center hover:brightness-75 hover:scale-90 active:scale-110 transition-all duration-100">
                <img src="/favicon.svg" class="size-10 p-1" />
            </RouterLink>
            <AiOutlineSearch aria-label="Search"
                    class="h-6 w-auto cursor-pointer p-2 box-content rounded-lg hover:bg-primary-300 hover:shadow-xs shadow-black/50"
                    @click="search" />
        </div>
        <div class="w-full h-12 flex flex-row bg-primary-400 hover:bg-primary-300 rounded-lg cursor-pointer transition-all duration-75 hover:scale-[98%] active:scale-95"
            @mousedown="toggleMode">
            <div class="h-full w-12">
                <BsChatLeft class="size-full p-3 box-border" v-if="uiStore.mode === 'chat'" />
                <PiNotepad class="size-full p-3 box-border" v-else />
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