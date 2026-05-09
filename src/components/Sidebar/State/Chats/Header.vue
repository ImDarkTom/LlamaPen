<script setup lang="ts">
import { emitter } from '@/lib/mitt';
import { BiSearchAlt2, BiWrench } from 'vue-icons-plus/bi';
import { TbListDetails } from 'vue-icons-plus/tb';

const logoFile = import.meta.glob('@/icons/llamapen/favicon.svg', { eager: true });
const logo = Object.values(logoFile)[0];

function search() {
    emitter.emit('openSearchbox');
}
</script>

<template>
    <div class="flex flex-col gap-2 px-2">
        <div class="flex flex-row p-0 box-border justify-between items-center">
            <div class="size-10 p-1"></div><!-- sidebar toggle space holder -->
            <Tooltip
                text="New Chat"
                size="tiny"
                class="w-1/2"
                :kbd-shortcut="{
                    ctrl: true,
                    shift: true,
                    key: 'o'
                }">
                <SidebarRouterLink 
                    to="/"
                    class="max-h-10 flex justify-center items-center hover:brightness-75 hover:scale-90 active:scale-110 transition-all duration-dynamic">
                    <logo alt="LlamaPen Logo" class="size-10 p-1 text-base-100" />
                </SidebarRouterLink>
            </Tooltip>
            <Tooltip
                text="Search"
                size="tiny"
                :kbd-shortcut="{
                    ctrl: true,
                    key: 'k',
                }">
                <BiSearchAlt2
                    class="h-6 w-auto cursor-pointer p-2 box-content rounded-lg text-base-100 hover:bg-base-800 hover:shadow-xs shadow-black/50"
                    @click="search" />
            </Tooltip>
        </div>

        <div class="flex flex-col pt-2 gap-px">
			<SidebarMenuLink
				text="Models"
				:icon="TbListDetails"
				:to="{ path: '/models' }" />

			<SidebarMenuLink
				text="Tools"
				:icon="BiWrench"
				:to="{ path: '/tools' }" />
		</div>
    </div>
</template>