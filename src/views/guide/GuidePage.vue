<script setup lang="ts">
import PageHeader from '@/components/Page/PageHeader.vue';
import router from '@/lib/router';
import setPageTitle from '@/utils/core/setPageTitle';
import hljs from 'highlight.js';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { BiLogoApple, BiLogoTux, BiLogoWindows } from 'vue-icons-plus/bi';

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
    *:mx-auto *:md:w-4/5 *:lg:w-3/5 *:max-w-3xl">
        <PageHeader text="Setup Guide" />

        <div class="flex flex-col h-full w-full box-border">
            <h2 class="text-3xl font-semibold pb-2 text-text">Connecting to your local Ollama instance</h2>
            <p>Ollama does not allow connections from any external URLs by default, so for this app to work you need to add this app's URL to
                Ollama's trusted origins and re-launch it. </p>
            <br>
            <p class="mt-6">Below are guides on how to do that on set different operating systems:</p>

            <h3 class="text-2xl pb-2 pt-4 flex flex-row items-center">
                <BiLogoWindows />&nbsp;Windows
            </h3>
            <p>On Windows you can do this by running this command in <b>Command Prompt</b> or <b>PowerShell</b></p>
            <br>

            <pre
                class="my-2"><code class="hljs language-bash !my-2">set OLLAMA_ORIGINS="{{ originUrl }}" & ollama serve</code></pre>
            <br>

            <p>This will temporarily allow connections to Ollama from this URL until Ollama is closed.</p>
            <br>

            <p class="mt-6">If you want to be able to connect without re-running this command each time, you can instead run
                another command to <b>persistently</b> add this app's URL to Ollama's trusted origins: </p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">setx OLLAMA_ORIGINS "{{ originUrl }}"</code></pre>
            <br>

            <p>After that, just open Ollama normally and you should be able to connect after refreshing this page.</p>

            <h3 class="text-2xl pb-2 pt-8 flex flex-row items-center">
                <BiLogoTux />/
                <BiLogoApple />&nbsp;Linux/MacOS
            </h3>
            <p>On linux or MacOS, you can run a similar command:</p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">export OLLAMA_ORIGINS="{{ originUrl }}" && ollama serve</code></pre>
            <br>

            <p>And similarly to persistently add to trusted origins you can do:</p>
            <br>

            <pre class="my-2"><code class="hljs language-bash !my-2">echo 'export OLLAMA_ORIGINS="{{ originUrl }}"' >> ~/.bashrc && source ~/.bashrc</code></pre>
            <br>

            <p>(This is assuming you are using <b>Bash</b>, other shells may have different ways of setting global variables)</p>

            <h2 class="text-3xl font-semibold pb-2 pt-12 text-text">Troubleshooting</h2>

            <h3 class="text-2xl flex flex-row items-center">Common Issues</h3>
            <h4 class="text-xl pb-2 pt-4 flex flex-row items-center italic">Error: listen tcp
                &#60;ip&#62;:&#60;port&#62;: bind: Only one usage of each socket address (protocol/network address/port)
                is normally permitted.</h4>

            <p class="pb-4">The most common cause for this error is that Ollama is already running. Make sure to close Ollama/end the
                process before trying again.
                <br><br>
                This may also happen if another program is running on the same port which is unlikely, however it is possible.
            </p>
        </div>
    </div>
</template>