<script setup lang="ts">
import { renderMarkdown } from '@/lib/marked';
import setPageTitle from '@/utils/core/setPageTitle';
import { onMounted, ref } from 'vue';

const originUrl = ref<string>(window.location.origin);

onMounted(() => {
    setPageTitle('Ollama Setup');
});

const text = `
# Connecting to your local Ollama instance

Ollama does not allow connections from any external URLs by default, so for 
this app to work you need to add this app's URL to Ollama's trusted origins and re-launch it.

Below are guides on how to do that on set different operating systems:

## Windows

On Windows you can do this by running this command in **Command Prompt** or **PowerShell**

\`\`\`bash
set OLLAMA_ORIGINS="${originUrl.value}" & ollama serve
\`\`\`

This will temporarily allow connections to Ollama from this URL until Ollama is closed.

If you want to be able to connect without re-running this command each time, you can 
instead run another command to **persistently** add this app's URL to Ollama's trusted origins:

\`\`\`bash
setx OLLAMA_ORIGINS "${originUrl.value}"
\`\`\`

After that, just open Ollama normally and you should be able to connect after refreshing this page.

## Linux/MacOS

On linux or MacOS, you can run a similar command if you run Ollama through the terminal:

\`\`\`bash
export OLLAMA_ORIGINS="${originUrl.value}" && ollama serve
\`\`\`

And similarly to persistently add to trusted origins you can do:

\`\`\`bash
echo 'export OLLAMA_ORIGINS="${originUrl.value}"' >> ~/.bashrc && source ~/.bashrc
\`\`\`

### If using Ollama systemd service

If you are instead running Ollama through a systemd service, a.k.a. in the background without an
open terminal window, you will instead have to edit the service's config file. To do this, run:

\`\`\`bash
sudo systemctl edit ollama.service
\`\`\`

Create a heading with name 'Service' and set the Environment value's OLLAMA_ORIGINS to the url like so:

\`\`\`conf
[Service]
Environment="OLLAMA_ORIGINS=\\"${originUrl.value}\\""
\`\`\`

The end result file should look something like:

\`\`\`conf
### Editing /etc/systemd/system/ollama.service.d/override.conf
### Anything between here and the comment below will become the contents of the drop-in file

[Service]
Environment="OLLAMA_ORIGINS=\\"${originUrl.value}\\""

### Edits below this comment will be discarded
...
\`\`\`

Then just restart the service:

\`\`\`bash
sudo systemctl restart ollama.service
\`\`\`

`;
</script>

<template>
    <GuideWrapper
        :html="renderMarkdown(text)"
        class="prose prose-app!" />
</template>
