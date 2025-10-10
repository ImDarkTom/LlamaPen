type AppToolSchema = ({
    name: string;
    type: 'string';
    description?: string;
    enum?: string[];
} | {
    name: string;
    type: 'number'| 'integer';
    description?: string;
    enum?: number[];
})[];

type AppTools = Record<string, {
    description: string;
    userConfirmation: boolean;
    requestOptions: {
        method: 'GET' | 'POST' | 'PUT' | 'PATCH';
        accept: string;
        contentType: string;
        userAgent: string;
        authorization?: string;
        body?: string;
    };
    params: AppToolSchema;
    required: string[];
    userHint?: string;
    url: string;
    responseFormatting?: string;
}>;
