<script setup lang="ts">
import { computed, ref } from 'vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { BsFillPinAngleFill, BsPinAngle } from 'vue-icons-plus/bs';
import SidebarRouterLink from './SidebarRouterLink.vue';
import type { IconType } from 'vue-icons-plus';

const hoveringOverIcon = ref<boolean>(false);
const entryTextRef = ref<HTMLInputElement | null>(null);

const pinned = computed(() => props.pinned === 1 || false);

const props = defineProps<{
	icon: IconType,
	type: string,
	id: number,
	title: string,
	pinned: 0 | 1,
	hoverMessage: string,
	isOpened: boolean,
	editing: boolean,
	isGeneratingTitle: boolean,
	setPinned: (pinned: boolean) => void,
	editName: (e: MouseEvent) => void,
	stopEditing: (save?: boolean) => void,
	deleteEntry: (e: MouseEvent) => void,
}>();

function editKeyPressed(e: KeyboardEvent) {
    if (e.key === "Enter") {
        props.stopEditing();
    } else if (e.key === "Escape") {
        props.stopEditing(false);
    }
}

defineExpose({
	entryTextRef,
});
</script>

<template>
	<SidebarRouterLink 
        :to="`/${props.type}/${props.id}`" 
        class="my-2 flex flex-col"
        :title="hoverMessage" 
        @dblclick="editName" 
        role="listitem"
    >
        <div class="group w-full h-10 flex flex-row gap-2 p-2 pointer-coarse:p-3 relative rounded-lg hover:text-text hover:bg-background transition-all duration-dynamic"
            :class="{ '!bg-background-light ring-1 ring-inset ring-border': props.isOpened }">
            <div class="box-content aspect-square" @mouseenter="hoveringOverIcon = true"
                @mouseleave="hoveringOverIcon = false">
                <template v-if="hoveringOverIcon || pinned">
                    <BsFillPinAngleFill v-if="pinned" class="box-border p-0.5 text-primary"
                        @mousedown="setPinned(false)" />
                    <BsPinAngle v-else class="box-border p-0.5" @mousedown="setPinned(true)" />
                </template>
                <component :is="icon" v-else class="box-border p-0.5" />
            </div>
            <div></div>
            <input type="text"
                class="cursor-pointer text-ellipsis w-full group-hover:w-[calc(100%-1rem)] outline-none group-hover:pointer-coarse:w-[calc(100%-1.5rem)]"
                @blur="stopEditing()" @keydown="editKeyPressed" ref="entryTextRef" :value="props.title" readonly
                :class="{ 
                    'rounded-sm border-2 border-border-muted': editing,
                    'opacity-50': props.isGeneratingTitle
                    }">
            <div 
                class="hidden group-hover:block hover:text-danger transition-colors duration-dynamic ease-in-out" 
                @click="deleteEntry">
                <AiOutlineClose/>
            </div>
        </div>
    </SidebarRouterLink>
</template>