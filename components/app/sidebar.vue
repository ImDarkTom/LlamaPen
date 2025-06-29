<script setup lang="ts">
const isSidebarOpen = useState('sidebar-open', () => true);
</script>

<template>
    <aside class="bg-background w-11/12 sm:w-1/3 lg:w-1/5 p-2 box-border">
        <NuxtLink to="/">
            <strong class="text-text">LlamaPen</strong>
        </NuxtLink>
    </aside>
</template>
