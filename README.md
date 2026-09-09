# LlamaPen

A no-install needed GUI for Ollama and other local LLM providers.

![App Preview](https://github.com/user-attachments/assets/d563f615-e1c9-4b41-92df-f46204f1a1ff)

## Features

- 🌐 Web-based interface usable on both desktop and mobile.
- ✅ Easy setup & configuration.
- 🧩 Works with Ollama, llama.cpp, LM Studio, Jan, vLLM, and any OpenAI-compatible server.
- 🖥️ Renders markdown, think text, LaTeX math.
- 🛠️ Custom tool call support.
- ⚡ Keyboard shortcuts for quick navigation.
- 🗃️ Built-in model & download manager.
- 🔌 Offline & PWA support.
- 🕊️ 100% Free & Open-Source.

## Setting Up

A [guide for setup](https://llamapen.app/guide) is included on the site. We've tried to make setup as smooth and straightforward as possible, letting you configure once and immediately start chatting any time your models are running.

Ollama is set up by default, so if that's what you're running there's nothing to configure. Once set-up, you can start chatting. All **chats are stored locally** in your browser giving you complete privacy and near-instant chat load times.

## Providers

LlamaPen is built for models running on your own hardware. Ollama is pre-configured, and one-click presets are included for other self-hosted servers:

- [Ollama](https://ollama.com/)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [LM Studio](https://lmstudio.ai/)
- [Jan](https://jan.ai/)
- [vLLM](https://github.com/vllm-project/vllm)

Anything else speaking the OpenAI-compatible API can be added by hand from the providers section in the settings, as can hosted APIs if you want the option. Add as many as you like and switch between them from the same place. Requests only ever go to the providers you configure yourself.

## Running Locally

> If you instead want to contribute/run a development server, check out the [contribution guide](CONTRIBUTING.md).

Running locally is made as straightforward as possible. There are two ways of getting a local LlamaPen instance:

### Docker (recommended)

This route assumes you have [Docker](https://www.docker.com/) installed on your system.

Pull the image:

```bash
docker pull ghcr.io/imdarktom/llamapen:latest
```

Run the image:

```bash
docker run -d -p 8080:80 --name llamapen --restart unless-stopped ghcr.io/imdarktom/llamapen:latest
```

> You can swap out the `8080` in the arguments for any port that you want LlamaPen to run on.

This will create a container that runs on startup with your computer and lets LlamaPen be accessible on localhost at the port specified.

### Manually

You may run the app manually without Docker by installing it and running it through Bun. This is slightly less preferrable as you might encounter issues due to differences in package/tool versions.

Make sure you have installed:

- [Git](https://git-scm.com/downloads)
- [Bun](https://bun.sh/) (1.3+ tested)

#### 1. Clone

```bash
git clone https://github.com/ImDarkTom/LlamaPen.git
cd LlamaPen
```

#### 2. Install dependencies

```bash
bun install
```

#### 3. Run

To run a local server:

```bash
bun run local
```

## LlamaPen Cloud

LlamaPen previously offered _LlamaPen Cloud_, a cloud service to run more powerful models. This has since been discontinued. For users wanting similar functionality there are built-in presets for OpenRouter and Ollama's native cloud models in the providers section of the app. All user accounts have been deleted and any refunds issued.

## Donating

Funding to help development is always appreciated, you can donate directly though GitHub Sponsors or buy me a coffee. I appreciate any sponsorship you give.

<a href="https://www.buymeacoffee.com/ImDarkTom" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="51" width="181"></a>

## Licenses & Attribution

- [Ollama](https://github.com/ollama/ollama)
- [Lobe Icons](https://github.com/lobehub/lobe-icons)
- [Nebula Sans Font](https://www.nebulasans.com/)
- [_Picture in the preview_](https://commons.wikimedia.org/w/index.php?curid=145806133)

_LlamaPen_ is [AGPL-3.0](https://github.com/ImDarkTom/LlamaPen?tab=AGPL-3.0-1-ov-file)
