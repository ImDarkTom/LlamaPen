import { defineStore } from 'pinia';
import { v4 as generateUUID } from 'uuid';

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
        findTextpadIndexById(id: string) {
            return this.textpads.findIndex((textpad) => textpad.id === id);
        },
		ensureChatInitialised(): string | null {
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
        }
	},
});