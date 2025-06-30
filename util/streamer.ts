export type StreamChunk<T> = {
    type: 'data';
    value: T;
} | {
    type: 'error';
    error: Error;
};

export async function* streamer<T>(
    fetchRequest: () => Promise<Response>,
    abortController: AbortController,
    parseChunk: (text: string) => T,
): AsyncGenerator<StreamChunk<T>> {
    try {
        const response = await fetchRequest();

        if (!response.ok || !response.body) {
            yield { type: 'error', error: new Error(`HTTP Error: ${response.status}`) };
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (abortController.signal.aborted) {
                reader.cancel();
                break;
            }

            if (done) break;

            const chunkText = decoder.decode(value, { stream: true });

            try {
                const parsed = parseChunk(chunkText);
                yield { type: 'data', value: parsed };
            }
            catch (err) {
                yield { type: 'error', error: new Error(`Parse error: ${(err as Error).message}`) };
            }
        }
    }
    catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
            yield { type: 'error', error: err as Error };
        }
    }
}
