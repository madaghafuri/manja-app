export interface Workspace {
	id: number;
	title: string;
	created_at: string;
}

export interface User {
	id: number;
	email: string;
	username: string;
	passkey: string;
	created_at: string;
}

export interface Project {
	id: number;
	title: string;
	workspace_id: number;
}
