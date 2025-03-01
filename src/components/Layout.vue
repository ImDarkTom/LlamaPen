<script setup lang="ts">
import Sidebar from './sidebar/Sidebar.vue';
import NotConnectedPopup from './ui/popups/NotConnectedPopup.vue';
</script>

<template>
    <Sidebar />
    <RouterView v-slot="{ Component }">
        <Transition name="page-switch" mode="out-in">
            <component :is="Component" />
        </Transition>
    </RouterView>
    <!-- todo: have it load all custom popups with one component -->
    <NotConnectedPopup />
</template>