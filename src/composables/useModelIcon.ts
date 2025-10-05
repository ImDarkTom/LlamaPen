import Unknown from '@/icons/unknown.svg';
import { useConfigStore } from '@/stores/config';

const iconModules = import.meta.glob('@/icons/*.svg', { import: 'default' });

function getModelIconMap(config: ReturnType<typeof useConfigStore>): Record<string, string> {
    return {
        llama: 'meta',
        gemma: 'gemma',
        gemini: config.ui.modelIcons.alternateGemmaIcon ? 'google' : 'gemma',
        deepseek: 'deepseek',
        qwen: 'qwen',
        qwq: 'qwen',
        mistral: 'mistral',
        mixtral: 'mistral',
        codestral: 'mistral',
        gpt: 'openai',
        phi: 'microsoft',
        llava: 'llava',
        nemotron: 'nvidia',
        deepcoder: 'together',
        'z.ai': 'zai',
        zai: 'zai',
        glm: 'zai',
        hunyuan: 'hunyuan',
        moonshot: 'moonshot',
        kimi: 'moonshot',
    };
}

const loadedIcons: Record<string, string> = {};

export function useModelIcon() {
    const config = useConfigStore();

    function getSlug(modelName?: string): string {
        if (!modelName) return 'unknown';

        const modelIconMap = getModelIconMap(config);

        const key = Object.keys(modelIconMap)
            .find(modelKey => modelName.toLowerCase().includes(modelKey));

        return key ? modelIconMap[key] : 'unknown';
    }

    async function getIcon(modelName: string, forceMonochrome?: boolean) {
        const slug = getSlug(modelName);
        const formattedSlug = config.ui.modelIcons.monochrome || forceMonochrome ? 
            slug : 
            `${slug}-color`;

        if (loadedIcons[formattedSlug]) return loadedIcons[formattedSlug]

        const match = Object.entries(iconModules).find(([path]) => path.endsWith(`${formattedSlug}.svg`));
        
        if (match) {
            const module = await match[1]();
            loadedIcons[formattedSlug] = (module as any).default;
            return (module as any).default;
        }

        return Unknown;
    }

    return { getIcon };
}