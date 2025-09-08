type ToolSchema<T> = Record<string, BaseSchema & T>;

type BaseSchema = {
    description?: string;
}

type StringSchema = ToolSchema<{
    type: 'string';
    enum?: string[];
}>

type NumberSchema = ToolSchema<{
    type: 'number' | 'integer';
}>

type ToolSchemas = 
    StringSchema |
    NumberSchema

type AppTools = Record<string, {
    description: string;
    params: ToolSchemas;
    required: string[];
}>;
