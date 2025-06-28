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
	<SidebarRouterLink :to="`/${props.type}/${props.id}`" @dblclick="editName" class="my-2 flex flex-col"
        :title="hoverMessage" role="listitem">
        <div class="group w-full h-10 flex flex-row gap-2 p-2 pointer-coarse:p-3 relative rounded-lg hover:bg-primary-300 transition-all duration-150"
            :class="{ '!bg-primary-300 ring-1 ring-inset ring-txt-1/50': props.isOpened }">
            <div class="box-content aspect-square" @mouseenter="hoveringOverIcon = true"
                @mouseleave="hoveringOverIcon = false">
                <template v-if="hoveringOverIcon || pinned">
                    <BsFillPinAngleFill v-if="pinned" class="box-border p-0.5 text-red-400"
                        @mousedown="setPinned(false)" />
                    <BsPinAngle v-else class="box-border p-0.5" @mousedown="setPinned(true)" />
                </template>
                <component :is="icon" v-else class="box-border p-0.5" />
            </div>
            <div></div>
            <input type="text"
                class="cursor-pointer text-ellipsis w-full group-hover:w-[calc(100%-1rem)] group-hover:pointer-coarse:w-[calc(100%-1.5rem)]"
                @blur="stopEditing()" @keydown="editKeyPressed" ref="entryTextRef" :value="props.title" readonly
                :class="{ 
                    '!bg-primary-500 rounded-sm outline-1 outline-txt-2': editing,
                    'outline-none': !editing, 
                    'opacity-50': props.isGeneratingTitle
                    }">
            <div 
                class="hidden group-hover:block hover:text-red-400 transition-colors duration-150 ease-in-out" 
                @click="deleteEntry">
                <AiOutlineClose/>
            </div>
        </div>
    </SidebarRouterLink>
</template>