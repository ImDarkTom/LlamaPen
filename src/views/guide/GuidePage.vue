<script setup lang="ts">
import router from '@/lib/router';
import setPageTitle from '@/utils/core/setPageTitle';
import hljs from 'highlight.js';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { AiFillApple, AiFillWindows, AiOutlineClose, AiOutlineLinux } from 'vue-icons-plus/ai';

const originUrl = ref<string>(window.location.origin);

onMounted(() => {
    setPageTitle('Setup Guide');
    document.addEventListener('keydown', handleEscape);
    hljs.highlightAll();
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape);
});

function handleEscape(e: KeyboardEvent) {
    if (document.activeElement?.tagName === 'BODY') {
        return;
    }

    if (e.key === 'Escape') {
        router.back();
    }
}

</script>

<template>
    <div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
    *:mx-auto *:md:w-4/5 *:lg:w-3/5">
        <div class="relative w-full flex flex-row justify-between items-center">
            <h1 class="text-4xl font-extrabold mt-2 pr-3 bg-primary-400">Setup Guide</h1>
            <div class="w-full h-0.5 bg-txt-1 absolute top-1/2 translate-y-1/2 -z-1 rounded-full"></div>
            <div class="bg-primary-400 pl-2 box-border">
                <AiOutlineClose
                    class="size-10 hover:bg-primary-300 cursor-pointer rounded-full p-1 transition-colors duration-100"
                    @click="router.back()" />
            </div>
        </div>

        <div class="flex flex-col h-full box-border">
            <h2 class="text-3xl font-semibold pb-2">Connecting to your local Ollama instance</h2>
            <p>Ollama does not allow external connections by default, for this app to work you need to add this URL to
                Ollama's
                trusted origins and re-launch it. </p>

            <h3 class="text-2xl pb-2 pt-4 flex flex-row items-center">
                <AiFillWindows />&nbsp;Windows
            </h3>
            <p>On Windows you can do this by running this command in <b>Command Prompt</b> or <b>PowerShell</b></p>
            <br>

            <pre
                class="my-2"><code class="hljs language-bash !my-2">set OLLAMA_ORIGINS="{{ originUrl }}" & ollama serve</code></pre>
            <br>

            <p>If you want to be able to connect without re-running this command each time, you can instead run
                this to <b>persistently</b> add this app URL to Ollama's trusted origins: </p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">setx OLLAMA_ORIGINS="{{ originUrl }}"</code></pre>
            <br>

            <p>After that, just open Ollama normally and you should be able to connect after refreshing this page.</p>

            <h3 class="text-2xl pb-2 pt-8 flex flex-row items-center">
                <AiOutlineLinux />/
                <AiFillApple />&nbsp;Linux/MacOS
            </h3>
            <p>On linux or MacOS, you can run a similar command:</p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">export OLLAMA_ORIGINS="{{ originUrl }}" && ollama serve</code></pre>
            <br>

            <p>And similarly to persistently add to trusted origins you can do:</p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">echo '\nexport OLLAMA_ORIGINS="{{ originUrl }}"' >> ~/.bashrc && source ~/.bashrc</code></pre>
            <br>

            <p>(This is assuming you are using <b>Bash</b>, other shells may have different ways of setting global variables)</p>

            <h2 class="text-3xl font-semibold pb-2 pt-12">Troubleshooting</h2>

            <h3 class="text-2xl flex flex-row items-center">Common Issues</h3>
            <h4 class="text-xl pb-2 pt-4 flex flex-row items-center italic">Error: listen tcp
                &#60;ip&#62;:&#60;port&#62;: bind: Only one usage of each socket address (protocol/network address/port)
                is normally permitted.</h4>

            <p class="pb-4">The most common cause for this error is that Ollama is already running. Make sure to close Ollama/end the
                process before trying again.
                <br><br>
                It may also happen if another app is running on the same port, which is unlikely, however it is a
                possibility.
            </p>
        </div>
    </div>
</template>