<script setup lang="ts"></script>

<template>
    <button
        class="select-none cursor-pointer rounded-lg transition-all duration-dynamic hover:bg-base-700 not-disabled:active:scale-98 h-10 p-2 box-border text-sm! font-medium!"
        v-bind="$attrs">
        <slot></slot>
    </button>
</template>
