<script setup>
const route = useRoute();
const idParam = route.params.id;

const id = typeof idParam === 'string' && !isNaN(Number(idParam)) ? Number(idParam) : null;
</script>

<template>
    <ChatPage :id />
</template>
