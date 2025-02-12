<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IpWrite } from 'vue-icons-plus/ip';
import { AiOutlineSearch } from 'vue-icons-plus/ai';

const router = useRouter();

const newChat = () => {
    router.push('/');
}

function search() {
    alert('to be added...');
}
</script>

<template>
    <div class="flex flex-row p-0 box-border">
        <span class="flex-1 text-2xl font-bold select-none">LlamaPen</span>
        <AiOutlineSearch aria-label="Search" class="h-6 w-auto m-auto cursor-pointer ml-2 p-2 box-content rounded-lg hover:bg-primary-300 hover:shadow-sm shadow-black" @click="search" />
        <IpWrite aria-label="New Chat" class="h-6 w-auto m-auto cursor-pointer ml-2 p-2 box-content rounded-lg hover:bg-primary-300 hover:shadow-sm shadow-black" @click="newChat()" />
    </div>
</template>