interface Note {
	id: number;
	title: string;
	createdAt: Date;
	lastEdited: Date;
	pinned: 0 | 1;
	content: string;
}