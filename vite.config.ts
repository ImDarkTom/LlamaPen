import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import svgLoader from 'vite-svg-loader';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), tailwindcss(), svgLoader()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        }
    },
});
