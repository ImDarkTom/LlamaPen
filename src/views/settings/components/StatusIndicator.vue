<script setup lang="ts">
import { BiSolidCheckSquare, BiSolidXSquare } from 'vue-icons-plus/bi';

defineProps<{
    state: boolean;
    label: string;
}>();
</script>

<template>
    <div>
        <component 
            :is="state ? BiSolidCheckSquare : BiSolidXSquare"
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