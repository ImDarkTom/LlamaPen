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
	openrouter: 'openrouter',
	deepscaler: 'deepseek',
	perplexity: 'perplexity',
	inflection: 'inflection',
	kwaipilot: 'kwaikat',
	anthropic: 'anthropic',
	deepcoder: 'together',
	snowflake: 'snowflake',
	bytedance: 'bytedance',
	microsoft: 'microsoft',
	inception: 'inception',
	nemotron: 'nvidia',
	moonshot: 'moonshot',
	deepseek: 'deepseek',
	upstage: 'upstage',
	kwaikat: 'kwaikat',
	tencent: 'tencent',
	stepfun: 'stepfun',
	mixtral: 'mistral',
	hunyuan: 'hunyuan',
	minimax: 'minimax',
	'r1-1776': 'deepseek',
	granite: 'ibm',
	command: 'cohere',
	openai: 'openai',
	liquid: 'liquid',
	relace: 'relace',
	amazon: 'nova',
	xiaomi: 'xiaomimimo',
	cohere: 'cohere',
	cogito: 'deepcogito',
	exaone: 'lg',
	gemini: 'gemini',
	hermes: 'nousresearch',
	arcee: 'arcee',
	gemma: 'gemma',
	morph: 'morph',
	baidu: 'baidu',
	llama: 'meta',
	llava: 'llava',
	stral: 'mistral',
	nous: 'nousresearch',
	qwen: 'qwen',
	grok: 'grok',
	kimi: 'moonshot',
	orca: 'microsoft',
	'z.ai': 'zai',
	aion: 'aionlabs',
	ai21: 'ai21',
	gpt: 'openai',
	phi: 'microsoft',
	zai: 'zai',
	glm: 'zai',
	qwq: 'qwen',
	yi: 'yi',
	google: 'google', // So Gemma icon takes priority
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