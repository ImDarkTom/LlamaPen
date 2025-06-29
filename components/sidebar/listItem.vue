<script setup lang="ts">
import type { Chat } from '~/lib/dexie';

defineProps<{
    chat: Chat;
    opened: boolean;
}>();

const toggleState = ref(false);
</script>

<template>
    <NuxtLink :to="`/chat/${chat.id}`">
        <Row
            class="w-full items-center p-2 hover:bg-background-light rounded-lg cursor-pointer"
            :class="{
                'bg-background': opened,
            }"
        >
            <div class="size-8 p-2">
                <Icon
                    name="hugeicons:message-01"
                />
            </div>
            <span class="grow">
                {{ chat.title }}
                <strong
                    v-if="chat.title === 'New Chat'"
                    class="text-text-muted/50"
                >#{{ chat.id }}</strong>
            </span>
            <DropdownMenuRoot v-model:open="toggleState">
                <DropdownMenuTrigger
                    class="size-8 p-2 rounded-lg cursor-pointer hover:bg-background-light"
                    aria-label="More options"
                >
                    <Icon
                        name="hugeicons:more-horizontal"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuContent class="bg-background-light p-3 rounded-lg">
                        <DropdownMenuItem
                            value="Rename"
                            class="text-text"
                            @click.prevent="console.log('renaming...')"
                        >
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuArrow class="fill-background-light" />
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </DropdownMenuRoot>
        </Row>
    </NuxtLink>
</template>
