type OllamaToolParamSchema = Record<string, {
    type: 'string';
    description?: string;
    enum?: string[];
} | {
    type: 'number'| 'integer';
    description?: string;
    enum?: number[];
}>;

type ModelListItem = {
    name: string;
    modified_at: Date;
    model: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
    capabilities?: ('completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search')[];
    llamapenMetadata?: {
        premium?: boolean;
        creator: string;
        tags?: ('alwaysReasons' | 'closedSource')[];
    }
}

type OllamaCapability = NonNullable<ModelListItem['capabilities']>[number];

type ModelList = ModelListItem[];

type ModelListResponse = {
    models: ModelList;
}

type CustomErrorResponse = {
    type: 'error';
    error: {
        type: string;
        message: string;
    }
}

type OllamaChatResponseChunk = {
    model: string;
    created_at: string;
    message: {
        role: OllamaMessageRole;
        content: string;
        thinking?: string;
        tool_calls?: OllamaToolCall[];
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
    } & Record<string, unknown>;
    tensors: {
        name: string;
        type: string;
        shape: number[];
    }[];
    capabilities: string[];
    modified_at: string;
}

type OllamaProcessesResponse = {
    models: ModelProcessInfo[];
}

type ModelProcessInfo = {
    name: string;
    model: string;
    size: number;
    digest: string;
    details: {
        parent_model: string;
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
    expires_at: string; // ISO 8601 format
    size_vram: number; // No. of bytes used in memory
}

type OllamaPullResponseChunk = {
    status: string | 'success'; // Various status messages like 'pulling manifest', 'downloading x', but the final chunk should always be 'success'
    digest?: string; // Might not be present for first few chunks
    total?: number; // Total size of the model in bytes
    completed?: number; // Number of bytes downloaded so far, might not be present for first few chunks
    error?: string; // Error message if any
}