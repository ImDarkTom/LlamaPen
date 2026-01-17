# LlamaPen

A no-install needed GUI for Ollama.

![Preview](https://github.com/user-attachments/assets/f16f82f4-9759-4b7d-8b8a-1abe64407c9f)

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

## Contributing/Running Locally

Contributing/running locally is also made as straightforward as possible. To get a local version of LlamaPen running on your machine, follow these steps:

### 0. Prerequisites

Make sure you have installed:

- [Git](https://git-scm.com/downloads)
- [Bun](https://bun.sh/) (1.3+)

### 1. Download

```bash
git clone https://github.com/ImDarkTom/LlamaPen
cd LlamaPen
```

### 2. Install dependencies

```bash
bun i
```

### 3. Run

If you want to run in **developer mode** and see changes in your code updated live, do:

```bash
bun dev
```

If you want to just **run locally** with no overhead, do:

```bash
bun run local
```

*That's it!* If you are contributing and using VSCode you can optionally install the extensions in the `extensions.json` file for a smoother development experience.

## LlamaPen Cloud

If you are using the [official site](https://llamapen.app/) (`https://llamapen.app`), you may choose to enable LlamaPen Cloud. LlamaPen Cloud is an optional service that lets you run the most powerful versions of the latest models using a cloud provider if you are not able to run them locally. While LlamaPen is free and open-source, LlamaPen Cloud offers an optional subscription for increasing rate limits and accessing more expensive models. 

For security reasons, LlamaPen Cloud is **not** open-source, however we strive to ensure your privacy (as outlined in the Cloud service [privacy policy](https://cloud.llamapen.app/privacy)), and the only time we have access to your chats is if you explicitly enable LlamaPen Cloud in the settings and send chat requests using one of the provided models. **No data is ever sent to LlamaPen Cloud if you do not enable it in the settings**.

## Donating

Funding to help development is always appreciated, whether that is through purchasing a subscription on LlamaPen API or donating directly, I will appreciate any sponsorship you give. 

<a href="https://www.buymeacoffee.com/ImDarkTom" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="51" width="181"></a>

## Licenses & Attribution

- [Ollama](https://github.com/ollama/ollama)
- [Lobe Icons](https://github.com/lobehub/lobe-icons)
- [Nebula Sans Font](https://www.nebulasans.com/)
- [*Picture in the preview*](https://commons.wikimedia.org/w/index.php?curid=145806133)

*LlamaPen* is [AGPL-3.0](https://github.com/ImDarkTom/LlamaPen?tab=AGPL-3.0-1-ov-file)
