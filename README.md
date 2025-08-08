# LlamaPen

A no-install needed GUI for Ollama.

![Preview](https://github.com/user-attachments/assets/5243a538-db02-4296-9baf-70f99a566b8c)

## Features

- 🌐 Web-based interface accessible on both desktop and mobile.
- ✅ Easy setup & configuration.
- 🛠️ Renders markdown, think text, LaTeX math.
- ⚡ Keyboard shortcuts for quick navigation.
- 🗃️ Built-in model & download manager.
- 🕊️ 100% Free & Open-Source.

## Setting Up

A [guide for setup](https://llamapen.app/guide) is included on the site. We've tried to make setup as smooth and straightforward as possible, letting you configure once and immediately start chatting any time Ollama is running.

Once set-up, you can start chatting. All **chats are stored locally** in your browser giving you complete privacy and near-instant chat load times. 

## Contributing

Contributing/running locally is also made as straightforward as possible. To get a local version of LlamaPen running on your machine, follow these steps:

### 0. Prerequisites
Make sure you have installed:
- [Git](https://git-scm.com/downloads)
- [Bun](https://bun.sh/) (1.2+)

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
```bash
bun dev
```

*That's it!* If you are using VSCode you can optionally install the extensions in the `extensions.json` file for a smoother development experience.

## LlamaPen API

If you are using the [official site](https://llamapen.app/) (`https://llamapen.app`), you can **optionally** enable LlamaPen API. LlamaPen API is a cloud service that lets you run the most powerful version of up-to-date models if you are not able to run them locally. Note that while LlamaPen is free and open-source, LlamaPen API offers an optional subscription for increasing rate limits and accessing more expensive models. 

For security purposes, LlamaPen API is **not** open-source, however we strive to ensure your privacy (as outlined in the API [privacy policy](https://api.llamapen.app/privacy)), and the only time we have access to your chats is when you explicitly enable LlamaPen API in the settings and send a chat request using one of the models. If you do not want to use this, keeping the toggle off will ensure that **no data is ever sent** to LlamaPen API servers.

## Donating

Funding to help development is always appreciated, whether that is through purchasing a subscription on LlamaPen API or donating directly, I will appreciate any sponsorship you decide to give. 

<a href="https://www.buymeacoffee.com/ImDarkTom" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## Licenses & Attribution
- [Ollama](https://github.com/ollama/ollama)
- [Lobe Icons](https://github.com/lobehub/lobe-icons)
- [*Picture in the preview*](https://commons.wikimedia.org/w/index.php?curid=145806133)

*LlamaPen* is [AGPL-3.0](https://github.com/ImDarkTom/LlamaPen?tab=AGPL-3.0-1-ov-file)
