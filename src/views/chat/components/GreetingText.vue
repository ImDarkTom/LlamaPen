<script lang="ts" setup>
function getGreetingMessage() {
    const hours = new Date().getHours();

    if (hours < 5) {
        return "Good late-night";
    } else if (hours < 12) {
        return "Good morning";
    } else if (hours < 18) {
        return "Good afternoon";
    } else if (hours < 22) {
        return "Good evening";
    } else {
        return "Good late-night";
    }
}

function getTimeInHHmm() {
    const hours = ("0" + new Date().getHours()).slice(-2);
    const minutes = ("0" + new Date().getMinutes()).slice(-2);

    return `${hours}:${minutes}`;
}
</script>

<template>
    <div class="flex flex-col justify-center md:justify-end items-center w-full h-full md:h-1/2 mb-2">
        <span class="text-2xl">{{ getGreetingMessage() }},</span>
        <span class="text-4xl font-semibold text-center text-text">What can I help you with?</span>
        <span class="pt-1">
            <span>{{ getTimeInHHmm() }}</span>
            &middot;
            <span>{{ new Date().toLocaleDateString() }}</span>
            &middot;
            <span>v1.0.0</span>
        </span>
    </div>
</template>