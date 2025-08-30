<script setup lang="ts">
import { BsCheckSquareFill, BsXSquareFill } from 'vue-icons-plus/bs';

defineProps<{
    state: boolean;
    label: string;
}>();
</script>

<template>
    <div>
        <component 
            :is="state ? BsCheckSquareFill : BsXSquareFill"
            class="inline mr-2"
            :class="{
                'text-success': state,
                'text-danger': !state
            }" />
        <span>
            {{ label }}
        </span>
    </div>
</template>