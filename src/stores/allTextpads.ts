import { defineStore } from 'pinia';
import { v4 as generateUUID } from 'uuid';

interface Textpad {
	id: string;
	label: string;
	content: string;
	created: number;
	lastEdited: number;
}

interface AllTextpadsState {
	textpads: Textpad[];
	openedId: string | null;
}

export const useTextpadStore = defineStore('textpad', {
	state: (): AllTextpadsState => ({
		textpads: [],
		openedId: null,
	}),
	getters: {
		openedTextpad: (state) => state.textpads.find(textpad => textpad.id === state.openedId),
        openedIdExists: (state) => state.textpads.find(textpad => textpad.id === state.openedId) !== undefined,
	},
	actions: {
		ensureChatInitialised(): string | null {
            this.loadTextpads();

            if (!this.openedId || !this.openedIdExists) {
                const newUuid = this.openedId || generateUUID();

                this.createChat(newUuid);
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
        createChat(uuid: string) {
            this.textpads.push({
                id: uuid,
                label: 'New Chat',
				content: '',
                created: Date.now(),
                lastEdited: Date.now(),
            });

            this.saveToLocalStorage();
        },
	},
});