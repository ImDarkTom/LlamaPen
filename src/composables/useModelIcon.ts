import Unknown from "@/icons/unknown.svg";

const allIcons = import.meta.glob('@/icons/*.svg', { eager: true });

const availableIcons: Map<string, Object> = new Map(Object.entries({
	'unknown': Unknown,
	'unknown-color': Unknown
}));

for (const [componentPath, moduleImport] of Object.entries(allIcons)) {
	const iconSlug = componentPath.split('/').pop()?.replace('.svg', '');
	if (iconSlug) {
		availableIcons.set(iconSlug, (moduleImport as { default: Object }).default);
	}
}

const modelIconMap: Record<string, string> = {
	openthinker: 'deepseek',
	'stable-code': 'stability',
	deepscaler: 'deepseek',
	deepcoder: 'together',
	snowflake: 'snowflake',
	nemotron: 'nvidia',
	moonshot: 'moonshot',
	deepseek: 'deepseek',
	mixtral: 'mistral',
	hunyuan: 'hunyuan',
	minimax: 'minimax',
	'r1-1776': 'deepseek',
	granite: 'ibm',
	command: 'cohere',
	cogito: 'deepcogito',
	exaone: 'lg',
	gemini: 'gemini',
	hermes: 'nousresearch',
	gemma: 'gemma',
	llama: 'meta',
	llava: 'llava',
	stral: 'mistral',
	nous: 'nousresearch',
	qwen: 'qwen',
	grok: 'grok',
	kimi: 'moonshot',
	orca: 'microsoft',
	'z.ai': 'zai',
	gpt: 'openai',
	phi: 'microsoft',
	zai: 'zai',
	glm: 'zai',
	qwq: 'qwen',
	yi: 'yi',
};

export function useModelIcon() {
    function getSlug(modelName: string): string {
        for (const [key, icon] of Object.entries(modelIconMap)) {
            if (modelName.includes(key)) {
                return icon;
            }
        }

        return 'unknown';
    }

    function getIcon(modelName: string, monochrome: boolean) {
		if (!modelName) return Unknown;
		
        const slug = getSlug(modelName);
        const slugFormated = monochrome ? slug : `${slug}-color`;

        return availableIcons.get(slugFormated);
    }

    return { getIcon };
}