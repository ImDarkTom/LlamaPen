import { useConfigStore } from "@/stores/config";
import { tryCatch } from "./tryCatch";

export default async function ollamaRequest(route: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: Record<string, any> | Array<any> | null | undefined) {
    return await tryCatch(fetch(useConfigStore().apiUrl(route), {
        method,
        body: body ? JSON.stringify(body) : null,
    }));
}