<script setup lang="ts">
</script>

<template>
    <div class="navbar">
        <div>
            <slot name="left"></slot>
        </div>
        <div>
            <slot name="right"></slot>
        </div>
    </div>
</template>

<style scoped>
.navbar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: var(--bg-4);
    padding: 1rem;
}
</style>
