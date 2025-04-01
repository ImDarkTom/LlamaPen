<script setup lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import NotConnectedPopup from '@/components/Popups/NotConnectedPopup.vue';
import ErrorPopup from '../Popups/ErrorPopup.vue';
import Lightbox from '../Lightbox/Lightbox.vue';
</script>

<template>
    <Sidebar />
    <RouterView v-slot="{ Component }">
        <Transition name="page-switch" mode="out-in">
            <component :is="Component" />
        </Transition>
    </RouterView>
    <!-- todo: have it load all custom popups with one component -->
    <ErrorPopup />
    <NotConnectedPopup />
    <Lightbox />
</template>