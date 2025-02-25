/**
 * Represents a single item in a model list.
 */
type ModelListItem = {
    name: string;
    model: string;
    /** Unix timestamp for last modified. */
    modified_at: string;
    /** Model size in bytes. */
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

/**
 * The expected response schema for `/api/tags`.
 */
type ModelListResponse = {
    models: ModelList;
}