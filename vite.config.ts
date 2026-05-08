import { fileURLToPath } from 'node:url';
import { execFileSync } from "node:child_process";

import { defineConfig } from 'vite';
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import svgLoader from 'vite-svg-loader';
import { VitePWA } from 'vite-plugin-pwa';
import removeAttribute from '@castlenine/vite-remove-attribute';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';

let commitHash: string;
try {
    commitHash = execFileSync(
        'git',
        ['rev-parse', 'HEAD'],
        { encoding: 'utf-8' }
    ).trim();
} catch {
    commitHash = 'unknown';
}

// https://vite.dev/config/
export default defineConfig({
    define: {
        __COMMIT_HASH__: JSON.stringify(commitHash),
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    plugins: [
        vue(), 
        tailwindcss(), 
        svgLoader(),
        Components({
            dts: '.vite/components.d.ts',
            dirs: [ 'src/components', 'src/views/**/components' ],
            directoryAsNamespace: true,
        }),
        AutoImport({
            dts: '.vite/auto-imports.d.ts',
            imports: [
                'vue',
                'vue-router',
                '@vueuse/core'
            ],
        }),
        VitePWA({ 
            manifest: {
                name: 'LlamaPen',
                short_name: 'LlamaPen',
                description: 'A no-install needed GUI for Ollama.',
                theme_color: '#020726',
                background_color: '#000019',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: "/icons/logo-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-256.png",
                        sizes: "256x256",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-180.png",
                        sizes: "180x180",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-152.png",
                        sizes: "152x152",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-120.png",
                        sizes: "120x120",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-64.png",
                        sizes: "64x64",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-48.png",
                        sizes: "48x48",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-32.png",
                        sizes: "32x32",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/icons/logo-16.png",
                        sizes: "16x16",
                        type: "image/png",
                        purpose: "any maskable"
                    }
                ]
            },
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: process.env.NODE_ENV === 'production'
                    ? ['**/*.{js,wasm,css,html,ico,png,svg,txt,xml}']
                    : []
            },
            devOptions: {
                enabled: true
            },
        }),
        process.env.NODE_ENV == 'production'
            ? removeAttribute({
                    extensions: [ 'vue' ],
                    attributes: [ 'data-testid' ]
                })
            : null,
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL('./src', import.meta.url)),
        }
    },
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        {
                            name: 'vue-vendor',
                            test: /node_modules[\\/](vue|vue-router|pinia|pinia-plugin-persistedstate)/,
                            priority: 20,
                        },
                        {
                            name: 'markdown',
                            test: /node_modules[\\/](marked|marked-katex-extension|katex|dompurify)/,
                            priority: 20,
                        },
                        {
                            name: 'highlightjs',
                            test: /node_modules[\\/]highlight\.js/,
                            priority: 20,
                        },
                        {
                            name: 'icons',
                            test: /node_modules[\\/]vue-icons-plus/,
                            priority: 20,
                        },
                        {
                            name: 'db',
                            test: /node_modules[\\/]dexie/,
                            priority: 20,
                        },
                        {
                            name: 'cloud',
                            test: /node_modules[\\/]@supabase\/supabase-js/,
                            priority: 20,
                        },
                        {
                            name: 'utils',
                            test: /node_modules[\\/](mitt|mustache)/,
                            priority: 20,
                        }
                    ]
                },
            },
        },
        chunkSizeWarningLimit: 1000
    }
});
