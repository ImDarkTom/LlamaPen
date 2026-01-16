import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        coverage: {
            exclude: [ 'dev-dist/', 'tailwind.config.js', 'eslint.config.mjs', 'vite.config.ts', 'dist/' ]
        },
    },
});