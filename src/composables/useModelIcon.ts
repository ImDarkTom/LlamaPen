import Unknown from '@/icons/unknown.svg';
import { useConfigStore } from '@/stores/config';

const allIcons = import.meta.glob('@/icons/*.svg');

const availableIcons: Record<string, any> = {
  'unknown': Unknown,
  'unknown-color': Unknown
};

const modelIconMap: Record<string, string> = {
	llama: 'meta',
	gemma: 'gemma',
	gemini: 'gemini',
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

const loadedIcons: Record<string, any> = {};

export function useModelIcon() {
    const config = useConfigStore();

    async function getIcon(slug: string) {
        if (loadedIcons[slug]) return loadedIcons[slug];

        const loader = availableIcons[slug];
        if (loader) {
            const module = await loader();
            loadedIcons[slug] = module.default;
            return loadedIcons[slug];
        }

        return Unknown;
    }

    function getSlug(modelName?: string): string {
        if (!modelName) return 'unknown';
        for (const key in modelIconMap) {
            if (modelName.includes(key)) return modelIconMap[key];
        }
        return 'unknown';
    }

    async function loadIcon(modelName: string, forceMonochrome?: boolean) {
        const slug = getSlug(modelName);
        const formattedSlug = config.ui.modelIcons.monochrome || forceMonochrome ? 
            slug : 
            `${slug}-color`;

        if (!(formattedSlug in allIcons)) {
            const match = Object.keys(allIcons).find(path => path.endsWith(`${formattedSlug}.svg`));
            if (match) {
                registerIcon(formattedSlug, allIcons[match]);
            }
        }

        return await getIcon(formattedSlug);
    }

    function registerIcon(slug: string, loader: () => Promise<any>) {
        if (!availableIcons[slug]) {
            availableIcons[slug] = loader;
        }
    }

    return {
        loadIcon,
    };
}