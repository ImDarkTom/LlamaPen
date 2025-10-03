<script setup lang="ts">
import { ref } from 'vue';
import FloatingMenu from './FloatingMenu.vue';
import DropdownMenu from '../Dropdown/DropdownMenu.vue';

const isOpened = ref(false);

document.addEventListener('keydown', () => {
    isOpened.value = false;
});

const count = ref(0)

</script>

<template>
    <FloatingMenu v-model:isOpened="isOpened">
        <template #button>
            <button>
                click me ({{ isOpened }})
            </button>
        </template>
        <template #menu>
            <DropdownMenu :opened="isOpened" direction="down">
                <div>
                    this is a menu
                    <div @click="count++">
                        clickable ({{ count }})
                    </div>
                    <FloatingMenu>
                        <template #button>
                            <button>inner button</button>
                        </template>
                        <template #menu>
                            <div>inner menu</div>
                        </template>
                    </FloatingMenu>
                </div>
            </DropdownMenu>
        </template>
    </FloatingMenu>
</template>