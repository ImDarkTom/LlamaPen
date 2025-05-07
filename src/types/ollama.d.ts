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
    capabilities?: ( 'completion' | 'tools' | 'vision' | 'insert' | 'embedding' | 'search' )[];
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