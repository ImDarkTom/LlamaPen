// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss'],
    devtools: { enabled: true },
    compatibilityDate: '2025-05-15',
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