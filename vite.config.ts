/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import svgLoader from 'vite-svg-loader';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from "node:child_process";
import removeAttribute from '@castlenine/vite-remove-attribute';

const commitHash = execSync('git rev-parse HEAD').toString().trim();

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
                globPatterns: ['**/*.{js,wasm,css,html,ico,png,svg,txt,xml}']
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
            "@": path.resolve(__dirname, "src"),
        }
    },
    test: {
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        coverage: {
            exclude: [ 'dev-dist/', 'tailwind.config.js', 'eslint.config.mjs', 'vite.config.ts', 'dist/' ]
        }
    }
});
