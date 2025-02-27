import { defineStore } from 'pinia';
import { v4 as generateUUID } from 'uuid';
import { useConfigStore } from './config';

interface AllTextpadsState {
	textpads: Textpad[];
	openedId: string | null;
}

export const useTextpadStore = defineStore('textpad', {
	state: (): AllTextpadsState => ({
		textpads: [] as Textpad[],
		openedId: null,
	}),
	getters: {
		openedTextpad: (state) => state.textpads.find(textpad => textpad.id === state.openedId),
        openedIdExists: (state) => state.textpads.find(textpad => textpad.id === state.openedId) !== undefined,
	},
	actions: {
        findTextpadIndexById(id: string) {
            return this.textpads.findIndex((textpad) => textpad.id === id);
        },
		ensureTextpadInitialised(): string | null {
            this.loadTextpads();

            if (!this.openedId || !this.openedIdExists) {
                const newUuid = this.openedId || generateUUID();

                this.createTextpad(newUuid);
                this.setOpened(newUuid);
                this.saveToLocalStorage();
                return newUuid;
            }

            return null;
            
        },
		saveToLocalStorage() {
            localStorage.setItem('textpads', JSON.stringify(this.textpads));
        },
		loadTextpads() {
            try {
                const textpads = JSON.parse(localStorage.getItem('textpads') || "[]");

                this.textpads = textpads;
            } catch (error: unknown) {
                console.error('Failed to load textpads from localStorage:', error);
                this.textpads = [];
            }
        },
		setOpened(id: string | null) {
            this.openedId = id;
        },
        createTextpad(uuid: string) {
            this.textpads.push({
                id: uuid,
                label: 'New Textpad',
				content: '',
                language: 'plaintext',
                created: Date.now(),
                lastEdited: Date.now(),
            });

            this.saveToLocalStorage();
        },
        editTextpadName(uuid: string, newName: string) {
            const chatToEditIndex = this.findTextpadIndexById(uuid);

            this.textpads[chatToEditIndex].label = newName;
            this.saveToLocalStorage();
        },
        deleteTextpad(uuid: string) {
            const textpadToDeleteIndex = this.findTextpadIndexById(uuid);

            if (textpadToDeleteIndex === -1) {
                return;
            }

            if (uuid === this.openedId) {
                this.openedId = null;
            }

            this.textpads.splice(textpadToDeleteIndex, 1);
            
            this.saveToLocalStorage();
        },

        // textpad-only
        write(text: string) {
            console.time("textpad-write");
            this.ensureTextpadInitialised();

            if (!this.openedTextpad) {
                throw new Error('New textpad failed to initialise in write.')
            }

            this.openedTextpad.content = text;
            this.saveToLocalStorage();
            console.timeEnd('textpad-write');
        },
        setLanguage(language: string) {
            this.ensureTextpadInitialised();

            if (!this.openedTextpad) {
                throw new Error('New textpad failed to initialise in setlanguage.')
            }

            this.openedTextpad.language = language;
            this.saveToLocalStorage();
        },
        async generateAutocompletion(text: string, maxWords: number = 1): Promise<string> {
            const selectedModel = localStorage.getItem('selectedModel');

            if (!selectedModel) throw new Error('No selected model found when generating autocompletions.');

            const controller = new AbortController();
            const signal = controller.signal;

            const response = await fetch(useConfigStore().apiUrl('/api/generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: text,
                    stream: true,
                    template: '{{ .Prompt }}'
                }),
                signal: signal,
            });

            if (!response.body) {
                throw new Error(`No response body recieved from sendMessage request, response code: ${response.status}`);
            }

            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();

            let streamedResponseText = "";
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    controller.abort('Finished response.');
                    break;
                }

                const chunkText = textDecoder.decode(value).trim().split('\n');

                for (const chunk of chunkText) {
                    try {
                        const chunkJson = JSON.parse(chunk);

                        const messageChunk = chunkJson.response;

                        streamedResponseText += messageChunk;

                        if (streamedResponseText.split(' ').length > maxWords + 1) {
                            controller.abort('Hit max words.');
                            return streamedResponseText;
                        }
                    } catch (error: unknown) {
                        console.error('Error parsing response chunk', error);
                    }
                }
            }

            return "";
        }
	},
});