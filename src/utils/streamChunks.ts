type Success<T> = { chunk: T; error: null };
type Failure<E> = { chunk: null; error: E };
type Result<T, E = Error> = Success<T> | Failure<E>;

export async function* streamChunks<T = unknown>(
    response: Response
): AsyncGenerator<Result<T>> {

    // Check if the response is ok and has a body
    // If not, yield an error and return
    if (!response.ok || !response.body) {
        yield {
            error: new Error(`HTTP Error: ${response.status} ${response.statusText}`),
            chunk: null,
        };
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        // Loop until done
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (value) {
                // Decode the value and append it to the buffer
                buffer += decoder.decode(value, { stream: true });

                // Emit every complete line as a chunk
                let newlineIndex: number;
                while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);

                    if (line) {
                        try {
                            const parsed = JSON.parse(line) as T;
                            yield { chunk: parsed, error: null };
                        } catch (parseError) {
                            yield {
                                error: new Error(`JSON parse error: ${parseError} - Line: ${line}`),
                                chunk: null,
                            };
                        }
                    }
                }
            }
        }

        // Handle any remaining data in the buffer after the stream ends
        if (buffer.trim()) {
            try {
                const parsed = JSON.parse(buffer.trim()) as T;
                yield { chunk: parsed, error: null };
            } catch (parseError) {
                yield {
                    error: new Error(`JSON parse error at end of stream: ${parseError} - Remaining buffer: ${buffer}`),
                    chunk: null,
                };
            }
        }
    } catch (err) {
        // Handle any errors that occurred during reading the stream
        yield { error: err instanceof Error ? err : new Error(String(err)), chunk: null };
    } finally {
        reader.releaseLock();
    }
}