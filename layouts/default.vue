<template>
    <div class="flex flex-row bg-background text-text-muted w-dvw h-dvh min-h-dvh">
        <AppSidebar />
        <main class="grow">
            <slot />
        </main>
    </div>
</template>
