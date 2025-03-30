interface Persona {
	id: string;
	name: string;
	icon: string;
	created: number;
	updated: number;
	brief: string;
	systemPrompt: string;
}

interface EditedPersona extends Persona {
	created?: number;
}