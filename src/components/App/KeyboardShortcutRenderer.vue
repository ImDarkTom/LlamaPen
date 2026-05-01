<script setup lang="ts">
import { formatHotkeys } from '@/utils/formatHotkeys';

const props = defineProps<{
    hotkey: Hotkey;
}>();

const platform = 'win';

const formatted = formatHotkeys(props.hotkey, platform);
</script>

<template>
    <div class="text-xs inline-flex text-base-400">
        <template 
            v-for="(key, index) in formatted"
            :key="key">
            <kbd>{{ key }}</kbd>

            <span v-if="platform === 'win' && index < (formatted.length - 1)">
                +
            </span>
        </template>
    </div>
</template>