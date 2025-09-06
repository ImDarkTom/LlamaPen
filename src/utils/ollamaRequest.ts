import { useConfigStore } from "@/stores/config";
import { tryCatch } from "./core/tryCatch";

export default async function ollamaRequest(
    route: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, any> | Array<any> | null | undefined,
    options?: { signal?: AbortSignal },
) {
    return await tryCatch(
        fetch(useConfigStore().apiUrl(route), {
            method,
            body: body ? JSON.stringify(body) : null,
            signal: options?.signal,
        })
    );
}