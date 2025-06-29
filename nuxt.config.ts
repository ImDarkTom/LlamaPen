import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
        'reka-ui/nuxt',
        '@nuxt/icon',
    ],
    devtools: { enabled: false },
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
