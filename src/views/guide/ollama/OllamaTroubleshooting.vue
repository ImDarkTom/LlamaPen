<script setup lang="ts">
import { renderMarkdown } from '@/lib/marked';
import setPageTitle from '@/utils/core/setPageTitle';

onMounted(() => {
    setPageTitle('Ollama Troubleshooting');
});

const text = `
# Ollama Troubleshooting

> Error: listen tcp &#60;ip&#62;:&#60;port&#62;: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.

On Windows this occurs when you already have Ollama running. Try closing the app/other command prompt
windows first before trying to run the command again.

On Linux/MacOS this will most likely happen if you are already running Ollama as a systemd service
rather than through a terminal. You can follow the instructions on the [setup page](/guide/ollama/setup)
if you want to use Ollama's systemd service instead, or if you just want to run the arguments temporarily
through a terminal, you can stop the service with \`sudo systemctl stop ollama.service\` and use the 
command  to run Ollama instead (although you may not be able to see all your models if you do this). 
`;
</script>

<template>
    <GuideWrapper
        :html="renderMarkdown(text)"
        class="prose prose-app!" />
</template>
