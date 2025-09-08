<script setup lang="ts">
import useToolsStore from '@/stores/toolsStore';


const toolsStore = useToolsStore();

</script>

<template>
    <div class="py-4 px-2">
        <div
            v-for="tool in toolsStore.tools">
            {{ tool.description }}
            {{ tool.params }}
        </div>
    </div>
</template>