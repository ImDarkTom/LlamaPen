type ModelListItem = {
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
    capabilities?: ('completion' | 'tools' | 'vision' | 'insert' | 'embedding' | 'search')[];
    llamapenMetadata?: {
        premium?: boolean;
        creator: string;
    }
}

type ModelList = ModelListItem[];

type ModelListResponse = {
    models: ModelList;
}

type OllamaChatResponseChunk = {
    model: string;
    created_at: string;
    message: {
        role: 'assistant' | 'user';
        content: string;
    };
    done: boolean;
    done_reason?: 'stop' | string;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

type OllamaModelInfoResponse = {
    license: string;
    modelfile: string;
    template: string;
    details: {
        parent_model: string;
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
    model_info: {
        'general.architecture': string;
        'general.basename': string;
        'general.file_type': number;
        'general.finetune': string;
        'general.languages': unknown | null;
        'general.parameter_count': number;
        'general.quantization_version': number;
        'general.size_label': string;
        'general.tags': unknown | null;
        'general.type': string;
        [key: string]: string;
    };
    tensors: {
        name: string;
        type: string;
        shape: number[];
    }[];
    capabilities: string[];
    modified_at: string;
}