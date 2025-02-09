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
    <div class="header">
        <span class="branding">LlamaPen</span>
        <AiOutlineSearch class="search right-icon" @click="search" />
        <IpWrite class="new-chat right-icon" @click="newChat()" />
    </div>
</template>

<style scoped lang="scss">
.header {
    display: flex;
    flex-direction: row;
    padding: 0rem;
    box-sizing: border-box;

    .branding {
        flex: 1;
        font-size: 1.5rem;
    }

    .right-icon {
        height: 1.65rem;
        margin: auto;
        width: auto;
        cursor: pointer;
        margin-left: 1ch;
        padding: 0.35rem;
        box-sizing: content-box;
        border-radius: 0.5rem;

        &:hover {
            background-color: var(--bg-3);
            box-shadow: 0px 2px 5px -2px rgba(0, 0, 0, 0.5);
        }
    }
}
</style>