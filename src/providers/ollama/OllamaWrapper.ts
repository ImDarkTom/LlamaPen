import logger from "@/lib/logger";
import { tryCatch } from "@/utils/core/tryCatch";
import { Ollama, type ChatRequest, type CopyRequest, type DeleteRequest, type ShowRequest, type PullRequest } from "ollama/browser";

/**
 * Wrapper for the Ollama SDK to handle errors and have centralized Ollama interactions.
 */
class OllamaWrapper {
    private baseConfig = {
		host: "http://127.0.0.1:11434", // useConfigStore().ollamaUrl
	};

    ollama = new Ollama(this.baseConfig);

    async version() {
        const response = await tryCatch(this.ollama.version());
                
        if (response.error) {
            logger.warn('OllamaWrapper:version', 'Error getting Ollama version:', response.error);
        }

        return response;
    }

    async list() {
        const { data, error } = await tryCatch(this.ollama.list());
                
        if (error) {
            logger.warn('OllamaWrapper:list', 'Error getting model list:', error);
            return [];
        }

        return data.models;
    }

    async ps() {
        const { data, error } = await tryCatch(this.ollama.ps());

        if (error) {
            logger.warn('OllamaWrapper:ps', 'Error getting loaded models:', error);
            return [];
        }

        return data.models;
    }

    async show(request: ShowRequest) {
        const response = await tryCatch(this.ollama.show(request));

        if (response.error) {
            logger.warn('OllamaWrapper:show', 'Error getting model info:', response.error);
        }

        return response;
    }

    async loadIntoMemory(modelId: string) {
        const { error } = await tryCatch(this.ollama.generate({
            model: modelId,
            prompt: undefined as unknown as string,
            keep_alive: -1,
        }));

        if (error) {
            logger.warn('OllamaWrapper:loadIntoMemory', 'Error loading model into memory:', error);
            return false;
        }

        return true;
    }

    async unloadFromMemory(modelId: string) {
        const { error } = await tryCatch(this.ollama.generate({
            model: modelId,
            prompt: undefined as unknown as string,
            keep_alive: 0,
        }));

        if (error) {
            logger.warn('OllamaWrapper:unloadFromMemory', 'Error unloading model from memory:', error);
            return false;
        }

        return true;
    }

    async pull(request: PullRequest & { stream: true }, abortController?: AbortController) {
        // If we give an abort controller, we need to create a new Ollama instance with a
        // fetch that uses that signal that way we can cancel the request if triggered.
        let ollamaInstance: Ollama;
        if (abortController) {
            ollamaInstance = new Ollama({
                ...this.baseConfig,
                fetch: (url, init) => {
                    return fetch(url, {
                        ...init,
                        signal: abortController.signal,
                    });
                }
            });
        } else {
            ollamaInstance = this.ollama;
        }

        const response = await tryCatch(ollamaInstance.pull(request));

        if (response.error) {
            logger.warn('OllamaWrapper:pull', 'Error pulling model:', response.error);
        }

        return response;
    }

    async copy(request: CopyRequest) {
        const { error } = await tryCatch(this.ollama.copy(request));

        if (error) {
            logger.warn('OllamaWrapper:copy', 'Error copying model:', error);
            return false;
        }

        return true;
    }

    async delete(request: DeleteRequest) {
        const { error } = await tryCatch(this.ollama.delete(request));

        if (error) {
            logger.warn('OllamaWrapper:delete', 'Error deleting model:', error);
            return false;
        }

        return true;
    }

    
    async chat(request: ChatRequest, abortSignal?: AbortSignal) {
        // If we give an abort controller, we need to create a new Ollama instance with a
        // fetch that uses that signal that way we can cancel the request if triggered.
        let ollamaInstance: Ollama;
        if (abortSignal) {
            ollamaInstance = new Ollama({
                ...this.baseConfig,
                fetch: (url, init) => {
                    return fetch(url, {
                        ...init,
                        signal: abortSignal,
                    });
                }
            });
        } else {
            ollamaInstance = this.ollama;
        }

        return ollamaInstance.chat({ ...request, stream: false });
    }

    async streamedChat(request: ChatRequest, abortSignal?: AbortSignal) {
        // If we give an abort controller, we need to create a new Ollama instance with a
        // fetch that uses that signal that way we can cancel the request if triggered.
        let ollamaInstance: Ollama;
        if (abortSignal) {
            ollamaInstance = new Ollama({
                ...this.baseConfig,
                fetch: (url, init) => {
                    return fetch(url, {
                        ...init,
                        signal: abortSignal,
                    });
                }
            });
        } else {
            ollamaInstance = this.ollama;
        }

        return ollamaInstance.chat({ ...request, stream: true });
    }
}

export const ollamaWrapper = new OllamaWrapper();