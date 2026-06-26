# LlamaPen

A no-install needed GUI for Ollama.

![App Preview](https://github.com/user-attachments/assets/f16f82f4-9759-4b7d-8b8a-1abe64407c9f)

## Features

- 🌐 Web-based interface usable on both desktop and mobile.
- ✅ Easy setup & configuration.
- 🖥️ Renders markdown, think text, LaTeX math.
- 🛠️ Custom tool call support.
- ⚡ Keyboard shortcuts for quick navigation.
- 🗃️ Built-in model & download manager.
- 🔌 Offline & PWA support.
- 🕊️ 100% Free & Open-Source.

## Setting Up

A [guide for setup](https://llamapen.app/guide) is included on the site. We've tried to make setup as smooth and straightforward as possible, letting you configure once and immediately start chatting any time Ollama is running.

Once set-up, you can start chatting. All **chats are stored locally** in your browser giving you complete privacy and near-instant chat load times.

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

LlamaPen previously offered *LlamaPen Cloud*, a cloud service to run more powerful models. This has since been discontinued. For users wanting similar functionality you may use OpenRouter as custom provider in the providers section of the app, or Ollama's native cloud models. All user accounts have been deleted and any refunds issued.

## Donating

Funding to help development is always appreciated, you can donate directly though GitHub Sponsors or buy me a coffee. I appreciate any sponsorship you give. 

<a href="https://www.buymeacoffee.com/ImDarkTom" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="51" width="181"></a>

## Licenses & Attribution

- [Ollama](https://github.com/ollama/ollama)
- [Lobe Icons](https://github.com/lobehub/lobe-icons)
- [Nebula Sans Font](https://www.nebulasans.com/)
- [*Picture in the preview*](https://commons.wikimedia.org/w/index.php?curid=145806133)

*LlamaPen* is [AGPL-3.0](https://github.com/ImDarkTom/LlamaPen?tab=AGPL-3.0-1-ov-file)
