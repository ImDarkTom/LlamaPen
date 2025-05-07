<script setup lang="ts">
import setPageTitle from '@/utils/title';
import hljs from 'highlight.js';
import { onMounted, ref } from 'vue';
import { AiFillApple, AiFillWindows, AiOutlineLinux } from 'vue-icons-plus/ai';

const originUrl = ref<string>(window.location.origin);

onMounted(() => {
    setPageTitle('Setup Guide');
    hljs.highlightAll();
});
</script>

<template>
    <div class="w-full h-full overflow-y-auto">
        <div class="flex flex-col h-full max-w-3xl mx-auto py-12 box-border">
            <h2 class="text-3xl font-semibold pb-2">Connecting to your local Ollama instance</h2>
            <p>Ollama does not allow external connections by default, for this app to work you need to add this URL to Ollama's
                trusted origins and re-launch it. </p>

            <h3 class="text-2xl pb-2 pt-4 flex flex-row items-center"><AiFillWindows />&nbsp;Windows</h3>
            <p>On Windows you can do this by running this in command prompt or powershell</p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">set OLLAMA_ORIGINS="{{ originUrl }}" & ollama serve</code></pre>
            <br>

            <p>or, if you want to be able to connect every time without re-running this command each time, you can instead run
                this to persistently add this app URL to Ollama's trusted origins: </p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">setx OLLAMA_ORIGINS="{{ originUrl }}"</code></pre>
            <br>

            <p>After that, just open Ollama normally and you should be able to connect after refreshing this page.</p>

            <h3 class="text-2xl pb-2 pt-4 flex flex-row items-center"><AiOutlineLinux />/<AiFillApple />&nbsp;Linux/MacOS </h3>
            <p>On linux or MacOS, you can run a similar command:</p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">export OLLAMA_ORIGINS="{{ originUrl }}" && ollama serve</code></pre>
            <br>

            <p>And similarly to persistently add to trusted origins you can do:</p>
            <br>

            <pre>
                <code class="hljs language-bash !my-2">echo 'export OLLAMA_ORIGINS="{{ originUrl }}"' >> ~/.bashrc && source ~/.bashrc</code>
            </pre>

            <h2 class="text-3xl font-semibold pb-2">Troubleshooting</h2>
            
            <h3 class="text-2xl flex flex-row items-center">Common Issues</h3>
            <h4 class="text-xl pb-2 pt-4 flex flex-row items-center italic">Error: listen tcp &#60;ip&#62;:&#60;port&#62;: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.</h4>

            <p>The most common cause for this error is that Ollama is already running. Make sure to close Ollama/end the process before trying again.
                <br><br>
                It may also happen if another app is running on the same port, which is unlikely, however it is a possibility.
            </p>
        </div>
    </div>
</template>