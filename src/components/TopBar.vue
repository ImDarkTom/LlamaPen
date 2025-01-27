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
    box-shadow: 0px 3px 10px -3px rgba(0, 0, 0, 127);
}
</style>
