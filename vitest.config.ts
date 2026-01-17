import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            setupFiles: './tests/setup.ts',
            coverage: {
                exclude: [ 'dev-dist/', 'tailwind.config.js', 'eslint.config.mjs', 'vite.config.ts', 'dist/' ]
            },
        },
    }),
);