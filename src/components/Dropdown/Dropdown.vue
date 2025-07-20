<script setup lang="ts">
import { ref } from 'vue';
import DropdownButton from '../Dropdown/DropdownButton.vue';
import DropdownMenu from '../Dropdown/DropdownMenu.vue';

// UI State
const opened = ref<boolean>(false);

// Functions
function handleClickOutside() {
    if (opened.value) {
        toggleOpened();
    }
}

function toggleOpened() {
    opened.value = !opened.value;

    if (props.onOpened) {
        props.onOpened(opened.value);
    }
}

const props = defineProps<{
    direction: 'up' | 'down',
    onOpened?: (opened: boolean) => void,
}>();

defineExpose({
    toggleOpened,
});
</script>

<template>
    <div v-mousedown-outside="handleClickOutside">
        <DropdownButton :direction :opened @update:opened="toggleOpened">
            <slot name="button" />
        </DropdownButton>

        <DropdownMenu :direction :opened role="listbox">
            <slot name="menu" />
        </DropdownMenu>
    </div>
</template>