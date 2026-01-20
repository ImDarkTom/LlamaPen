type OllamaCapabilities = ('completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search')[];
type OllamaCapability = OllamaCapabilities[number];

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
    capabilities?: OllamaCapabilities;
    llamapenMetadata?: {
        premium?: boolean;
        creator: string;
        tags?: ('alwaysReasons' | 'closedSource')[];
    }
}

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