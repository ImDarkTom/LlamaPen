import useToolsStore from "@/stores/toolsStore";

export function appToolsToOllama(): unknown[] {
    const toggledToolsNames = useToolsStore().toggled;
    const toggledTools = Object.entries(useToolsStore().tools).filter(data => toggledToolsNames.includes(data[0]));

    const toolsList: unknown[] = [];

    for (const tool of toggledTools) {
        const toolInList = {
            type: 'function',
            function: {
                name: tool[0],
                description: tool[1].description,
                parameters: {
                    type: 'object',
                    properties: {} as OllamaToolParamSchema,
                    required: tool[1].required,
                }
            }
        };
        

        for (const param of tool[1].params) {
            toolInList.function.parameters.properties[param.name] = {
                type: param.type,
                description: param.description,
                ...(param.enum ?? { enum: param.enum })
            };
        }

        toolsList.push(toolInList);
    }

    return toolsList;
}