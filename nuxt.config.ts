import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/eslint'],
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    compatibilityDate: '2025-05-15',
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    eslint: {
        config: {
            stylistic: {
                semi: true,
                indent: 4,
                quotes: 'single',
                commaDangle: 'always-multiline',
            },
        },
    },
});
