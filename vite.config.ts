import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(path.join(path.dirname(__filename), "src/")),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use '@/styles/mixins.scss' as mixin;`,
            },
        },
    },
});
