// eslint.config.mjs
import pluginVue from 'eslint-plugin-vue'
import {
    defineConfigWithVueTs,
    vueTsConfigs,
    configureVueProject,
} from '@vue/eslint-config-typescript'

configureVueProject({
    tsSyntaxInTemplates: true,
    scriptLangs: [
        'ts',
    ],
    allowComponentTypeUnsafety: true,
    rootDir: import.meta.dirname,
})

export default defineConfigWithVueTs(
    pluginVue.configs["flat/essential"],
    vueTsConfigs.recommended,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
            ],
        }
    }
)