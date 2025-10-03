<script setup lang="ts">
import { ref } from 'vue';
import FloatingMenu from './FloatingMenu.vue';

const isOpened = ref(false);

document.addEventListener('keydown', () => {
    isOpened.value = false;
});

const count = ref(0)

const innerOpened = ref(false);

</script>

<template>
    <FloatingMenu v-model:isOpened="isOpened">
        <template #button>
            <button>
                click me ({{ isOpened }})
            </button>
        </template>
        <template #menu>
            <div>
                this is a menu
                <div @click="count++">
                    clickable ({{ count }})
                </div>
                <FloatingMenu v-model:isOpened="innerOpened">
                    <template #button>
                        <button>inner button</button>
                    </template>
                    <template #menu>
                        <div>inner menu</div>
                    </template>
                </FloatingMenu>
            </div>
        </template>
    </FloatingMenu>
</template>