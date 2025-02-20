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
    }
}

type ModelList = ModelListItem[];

type ModelListResponse = {
    models: ModelList;
}